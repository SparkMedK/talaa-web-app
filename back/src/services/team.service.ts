import Team from '../models/Team.model';
import TeamPlayer from '../models/TeamPlayer.model';
import Game from '../models/Game.model';
import User from '../models/User.model';

export const createTeams = async (gameId: string, adminId: string, names: string[]) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.adminId.toString() !== adminId) throw new Error('Unauthorized');

    const teams = [];
    for (let i = 0; i < names.length; i++) {
        const team = new Team({
            gameId,
            name: names[i],
            order: i
        });
        await team.save();
        teams.push(team);
    }
    return teams;
};

export const assignPlayer = async (teamId: string, adminId: string, playerId: string) => {
    const team = await Team.findById(teamId);
    if (!team) throw new Error('Team not found');

    const game = await Game.findById(team.gameId);
    if (!game) throw new Error('Game not found');
    if (game.adminId.toString() !== adminId) throw new Error('Unauthorized'); // Check if admin is performing action

    const user = await User.findById(playerId);
    if (!user) throw new Error('User not found');

    // Remove player from other teams in this game first (if needed, though not strictly specified, good practice)
    // For now assuming player is free or multiple team assignment not allowed logic handled by UI or simple restriction here.
    // Check if player is already in a team for this game?
    // Let's implement strict: Remove from ANY team in this game first.
    const teamsInGame = await Team.find({ gameId: game._id });
    const teamIds = teamsInGame.map(t => t._id);
    await TeamPlayer.deleteMany({ userId: playerId, teamId: { $in: teamIds } });

    const teamPlayer = new TeamPlayer({
        teamId,
        userId: playerId
    });
    await teamPlayer.save();
    return teamPlayer;
};

export const removePlayer = async (teamId: string, adminId: string, playerId: string) => {
    const team = await Team.findById(teamId);
    if (!team) throw new Error('Team not found');

    const game = await Game.findById(team.gameId);
    if (!game) throw new Error('Game not found');
    if (game.adminId.toString() !== adminId) throw new Error('Unauthorized');

    return await TeamPlayer.findOneAndDelete({ teamId, userId: playerId });
};
