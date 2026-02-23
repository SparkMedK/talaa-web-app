import Round from '../models/Round.model';
import Turn from '../models/Turn.model';
import Game from '../models/Game.model';
import Team from '../models/Team.model';
import { generateWords } from '../utils/wordGenerator';

export const createRound = async (gameId: string, adminId: string) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.adminId.toString() !== adminId) throw new Error('Unauthorized');
    if (game.status === 'FINISHED') throw new Error('Game is finished');

    // Get current round number
    const lastRound = await Round.findOne({ gameId }).sort({ roundNumber: -1 });
    const roundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

    const round = new Round({
        gameId,
        roundNumber,
        status: 'ACTIVE'
    });
    await round.save();

    game.currentRound = roundNumber;
    await game.save();

    return round;
};

export const startTurn = async (roundId: string, callerId: string) => {
    const round = await Round.findById(roundId);
    if (!round) throw new Error('Round not found');

    const game = await Game.findById(round.gameId);
    if (!game) throw new Error('Game not found');
    if (game.status === 'FINISHED') throw new Error('Game is already finished');

    // 1. Check for active turns in this round
    const activeTurn = await Turn.findOne({ roundId, status: 'ACTIVE' });
    if (activeTurn) throw new Error('A turn is already in progress');

    const teams = await Team.find({ gameId: round.gameId }).sort({ order: 1 });
    if (teams.length === 0) throw new Error('No teams found for this game');

    // 2. Identify whose team turn it is
    const lastTurn = await Turn.findOne({ gameId: round.gameId }).sort({ startTime: -1, _id: -1 });

    let nextTeam;
    if (!lastTurn) {
        nextTeam = teams[0];
    } else {
        const lastTeamIndex = teams.findIndex(t => t._id.toString() === lastTurn.teamId.toString());
        const nextTeamIndex = (lastTeamIndex + 1) % teams.length;
        nextTeam = teams[nextTeamIndex];
    }

    // 3. Identify the player in that team whose turn it is to describe (Round-Robin)
    const TeamPlayer = (await import('../models/TeamPlayer.model')).default;
    const teamMembers = await TeamPlayer.find({ teamId: nextTeam._id }).sort({ _id: 1 });

    if (teamMembers.length === 0) {
        throw new Error(`Team ${nextTeam.name} has no players assigned`);
    }

    // Ensure caller is from the correct team
    const teamIdsInGame = teams.map(t => t._id);
    const caller = await TeamPlayer.findOne({ userId: callerId, teamId: { $in: teamIdsInGame } });
    if (!caller || caller.teamId.toString() !== nextTeam._id.toString()) {
        throw new Error(`It is not your team's turn. It is ${nextTeam.name}'s turn.`);
    }

    // Calculate how many turns this team has COMPLETED in this game to determine rotation
    const completedTurnsCount = await Turn.countDocuments({
        gameId: round.gameId,
        teamId: nextTeam._id,
        status: 'COMPLETED'
    });

    const describerIndex = completedTurnsCount % teamMembers.length;
    const describerId = teamMembers[describerIndex].userId;

    // Generate words
    const words = generateWords(5);

    const turn = new Turn({
        roundId,
        gameId: round.gameId,
        teamId: nextTeam._id,
        describerId,
        words,
        startTime: new Date(),
        duration: 30, // Default 30s
        status: 'ACTIVE'
    });
    await turn.save();
    return turn;
};


export const endTurn = async (turnId: string) => {
    const turn = await Turn.findById(turnId);
    if (!turn) throw new Error('Turn not found');

    if (turn.status === 'COMPLETED') return turn;

    turn.status = 'COMPLETED';
    await turn.save();

    // Check winning condition
    const game = await Game.findById(turn.gameId);
    if (!game) throw new Error('Game not found');

    const team = await Team.findById(turn.teamId);
    if (team && team.score >= game.winningScore) {
        game.status = 'FINISHED';
        await game.save();
    }

    return turn;
};
