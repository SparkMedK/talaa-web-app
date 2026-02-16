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
    const turns = await Turn.find({ roundId: { $in: roundIds } });

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
    await Turn.deleteMany({ roundId: { $in: roundIds } });
    await Round.deleteMany({ gameId });

    // Reset scores
    await Team.updateMany({ gameId }, { score: 0 });

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

    return await User.findByIdAndDelete(playerId);
};
