import Round from '../models/Round.model';
import Turn from '../models/Turn.model';
import Game from '../models/Game.model';
import Team from '../models/Team.model';
import { generateWords } from '../utils/wordGenerator';

export const createRound = async (gameId: string, adminId: string) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.adminId.toString() !== adminId) throw new Error('Unauthorized');

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

export const startTurn = async (roundId: string, describerId: string) => {
    const round = await Round.findById(roundId);
    if (!round) throw new Error('Round not found');

    // Logic to determine team? 
    // Usually, the game logic decides whose turn it is. 
    // For simplicity based on requirements, we might need more info or infer it.
    // Let's assume the client sends the teamId or we infer it from the user.
    // Wait, the API doesn't take teamId in body. 
    // "POST /rounds/:roundId/turns/start"
    // We need to find which team the describer belongs to.

    // Find team for user in this game
    // We need to look up TeamPlayer, but we don't have easy access here without importing models or helper.
    // Let's rely on finding the TeamPlayer.
    const TeamPlayer = (await import('../models/TeamPlayer.model')).default;
    const teamPlayer = await TeamPlayer.findOne({ userId: describerId });

    // We should also check if the team belongs to the game of the round.
    if (!teamPlayer) throw new Error('User not assigned to a team');

    const team = await Team.findById(teamPlayer.teamId);
    if (!team) throw new Error('Team not found');
    if (team.gameId.toString() !== round.gameId.toString()) throw new Error('User team not in this game');

    // VALIDATION: Ensure it's this team's turn and this user is the next describer
    // Find all teams in the game sorted by order
    const teams = await Team.find({ gameId: round.gameId }).sort({ order: 1 });
    const lastTurn = await Turn.findOne({ roundId }).sort({ startTime: -1 });

    let nextTeamIndex = 0;
    if (lastTurn) {
        const lastTeamIndex = teams.findIndex(t => t._id.toString() === lastTurn.teamId.toString());
        nextTeamIndex = (lastTeamIndex + 1) % teams.length;
    }

    if (teams[nextTeamIndex]._id.toString() !== team._id.toString()) {
        throw new Error('It is not your team\'s turn');
    }

    // Usually, we'd also track whose turn it is specifically within the team if we want strict describer rotation.
    // For now, let's just allow anyone on the correct team to start, as they will BECOME the describer.

    // Generate words
    const words = generateWords(5);

    const turn = new Turn({
        roundId,
        teamId: team._id,
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

    turn.status = 'COMPLETED';
    await turn.save();
    return turn;
};
