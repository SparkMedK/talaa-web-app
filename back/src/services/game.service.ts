import Game, { IGame } from '../models/Game.model';
import User, { IUser } from '../models/User.model';
import Team from '../models/Team.model';
import TeamPlayer from '../models/TeamPlayer.model';
import Round from '../models/Round.model';
import Turn from '../models/Turn.model';

const generateUniqueCode = async (): Promise<string> => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;

    while (!isUnique) {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existingGame = await Game.findOne({ code });
        if (!existingGame) {
            isUnique = true;
        }
    }

    return code;
};

export const createGame = async (input: { nickname: string }) => {
    const code = await generateUniqueCode();
    // Create the game first (without adminId initially)
    const game = new Game({ code });

    // Create the admin user
    const user = new User({
        nickname: input.nickname,
        role: 'ADMIN',
        gameId: game._id as any
    });
    await user.save();

    // Update game with adminId
    game.adminId = user._id as any;
    await game.save();

    return {
        gameId: game._id,
        userId: user._id,
        ...game.toObject()
    };
};

export const getGameState = async (gameIdOrCode: string) => {
    let game;
    if (gameIdOrCode.length === 24) {
        game = await Game.findById(gameIdOrCode);
    } else {
        game = await Game.findOne({ code: gameIdOrCode.toUpperCase() });
    }

    if (!game) throw new Error('Game not found');

    const gameId = game._id;
    const users = await User.find({ gameId });
    const teams = await Team.find({ gameId });
    const rounds = await Round.find({ gameId });
    // Fetch turns for all rounds
    const roundIds = rounds.map(r => r._id);
    const turns = await Turn.find({ gameId }).sort({ startTime: 1 });

    // Fetch team players to show which players are assigned to which teams
    const teamIds = teams.map(t => t._id);
    const teamPlayers = await TeamPlayer.find({ teamId: { $in: teamIds } });

    return {
        ...game.toObject(),
        users,
        teams,
        teamPlayers,
        rounds,
        turns
    };
};

export const startGame = async (gameId: string, userId: string) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.adminId.toString() !== userId) throw new Error('Unauthorized');

    game.status = 'PLAYING';
    await game.save();
    return game;
};

export const restartGame = async (gameId: string, userId: string) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.adminId.toString() !== userId) throw new Error('Unauthorized');

    // Reset game status
    game.status = 'LOBBY';
    game.currentRound = 0;
    await game.save();

    // Delete rounds, turns
    const rounds = await Round.find({ gameId });
    const roundIds = rounds.map(r => r._id);
    await Turn.deleteMany({ gameId });
    await Round.deleteMany({ gameId });

    // Clear team players and teams
    const teams = await Team.find({ gameId });
    const teamIds = teams.map(t => t._id);
    await TeamPlayer.deleteMany({ teamId: { $in: teamIds } });
    await Team.deleteMany({ gameId });

    return game;
};

export const joinGame = async (gameIdOrCode: string, nickname: string) => {
    let game;
    if (gameIdOrCode.length === 24) {
        game = await Game.findById(gameIdOrCode);
    } else {
        game = await Game.findOne({ code: gameIdOrCode.toUpperCase() });
    }

    if (!game) throw new Error('Game not found');

    const user = new User({
        nickname,
        role: 'PLAYER',
        gameId: game._id as any
    });
    await user.save();

    const gameState = await getGameState(game._id.toString());

    return {
        userId: user._id,
        ...gameState
    };
};

export const leaveGame = async (gameId: string, userId: string) => {
    return await User.findByIdAndDelete(userId);
};

export const kickPlayer = async (gameId: string, adminId: string, playerId: string) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.adminId.toString() !== adminId) throw new Error('Unauthorized');
    if (game.status === 'FINISHED') throw new Error('Game is already finished');

    // Block kick while a turn is actively running
    const activeTurn = await Turn.findOne({ gameId, status: 'ACTIVE' });
    if (activeTurn) {
        throw new Error('Cannot kick a player while a turn is in progress. Wait for the turn to end.');
    }

    // Find the player's team assignment in this game
    const teamPlayer = await TeamPlayer.findOne({ userId: playerId });
    const teamId = teamPlayer?.teamId;

    // Remove player from TeamPlayer
    if (teamPlayer) {
        await TeamPlayer.findByIdAndDelete(teamPlayer._id);
    }

    // Delete the user record
    await User.findByIdAndDelete(playerId);

    if (teamId) {
        const remainingTeamMembers = await TeamPlayer.find({ teamId });

        if (remainingTeamMembers.length < 2) {
            // Team must have at least 2 players to be valid — delete it
            await Team.findByIdAndDelete(teamId);

            // End the game if only 1 (or 0) team remains
            const remainingTeams = await Team.find({ gameId });
            if (remainingTeams.length < 2 && game.status === 'PLAYING') {
                game.status = 'FINISHED';
                await game.save();
            }
        }
    }

    return {
        message: 'Player kicked successfully',
        gameStatus: game.status
    };
};

export const deleteTeam = async (gameId: string, adminId: string, teamId: string) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.adminId.toString() !== adminId) throw new Error('Unauthorized');
    if (game.status === 'FINISHED') throw new Error('Game is already finished');

    // Block delete while a turn is actively running
    const activeTurn = await Turn.findOne({ gameId, status: 'ACTIVE' });
    if (activeTurn) {
        throw new Error('Cannot delete a team while a turn is in progress. Wait for the turn to end.');
    }

    const team = await Team.findById(teamId);
    if (!team) throw new Error('Team not found');

    // Find all players in this team
    const teamPlayers = await TeamPlayer.find({ teamId });
    const playerIds = teamPlayers.map(tp => tp.userId);

    // Delete TeamPlayer records to unassign players (moving them to waiting area)
    await TeamPlayer.deleteMany({ teamId });

    // Delete the Team
    await Team.findByIdAndDelete(teamId);

    // End the game if only 1 (or 0) team remains
    const remainingTeams = await Team.find({ gameId });
    if (remainingTeams.length < 2 && game.status === 'PLAYING') {
        game.status = 'FINISHED';
        await game.save();
    }

    return {
        message: 'Team deleted successfully',
        gameStatus: game.status
    };
};
