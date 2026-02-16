import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { createTeam, assignPlayerToTeam, startGame } from '../api/endpoints';
import { UserRole, GameStatus } from '../types';
import { Users, Crown, Play, Plus } from 'lucide-react';

export const Lobby: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { gameState, userId, fetchGame } = useGameStore();
    const [newTeamName, setNewTeamName] = useState('');

    // Polling
    useEffect(() => {
        if (!gameId) return;
        fetchGame(gameId); // Initial fetch
        const interval = setInterval(() => fetchGame(gameId), 2000);
        return () => clearInterval(interval);
    }, [gameId, fetchGame]);

    // Redirect if playing
    useEffect(() => {
        if (gameState?.status === GameStatus.PLAYING) {
            navigate(`/game/${gameId}`);
        }
    }, [gameState?.status, gameId, navigate]);

    if (!gameState) return <div className="text-white text-center mt-20">Loading Lobby...</div>;

    const isAdmin = gameState.users?.find(u => u._id === userId)?.role === UserRole.ADMIN;


    // Accessing teamPlayers from gameState (assuming it exists in response)
    const allTeamPlayers = (gameState as any).teamPlayers || [];

    const playersInTeams = new Set(allTeamPlayers.map((tp: any) => tp.userId));
    const trulyUnassigned = gameState.users?.filter(u => !playersInTeams.has(u._id)) || [];

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gameId || !newTeamName) return;
        try {
            await createTeam(gameId, newTeamName);
            setNewTeamName('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssign = async (teamId: string, userId: string) => {
        try {
            await assignPlayerToTeam(teamId, userId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartGame = async () => {
        if (!gameId) return;
        try {
            await startGame(gameId);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Lobby
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-sm">INVITE CODE:</span>
                        <span className="text-2xl font-black text-blue-400 tracking-widest">{gameState.code}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
                        <Users size={18} className="text-gray-400" />
                        <span>{gameState.users?.length} / {gameState.maxPlayers} Players</span>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={handleStartGame}
                            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                        >
                            <Play size={18} /> Start Game
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Unassigned Players */}
                <div className="bg-gray-800 rounded-xl p-6 h-fit">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Users className="text-yellow-400" /> Waiting Area
                    </h2>
                    <div className="space-y-2">
                        {trulyUnassigned.map(user => (
                            <div key={user._id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    {user.role === UserRole.ADMIN && <Crown size={14} className="text-yellow-500" />}
                                    {user.nickname}
                                </span>
                                {isAdmin && gameState.teams && gameState.teams.length > 0 && (
                                    <div className="flex gap-1">
                                        {gameState.teams.map(team => (
                                            <button
                                                key={team._id}
                                                onClick={() => handleAssign(team._id, user._id)}
                                                className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded"
                                                title={`Assign to ${team.name}`}
                                            >
                                                {team.name.substring(0, 2).toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {trulyUnassigned.length === 0 && (
                            <p className="text-gray-500 text-sm text-center italic">No players waiting.</p>
                        )}
                    </div>
                </div>

                {/* Teams Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold">Teams</h2>
                        {isAdmin && (
                            <form onSubmit={handleCreateTeam} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="New Team Name"
                                    className="bg-gray-700 border-none rounded px-3 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button type="submit" className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500">
                                    <Plus size={18} />
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {gameState.teams?.map(team => {
                            const teamMembers = allTeamPlayers
                                .filter((tp: any) => tp.teamId === team._id)
                                .map((tp: any) => gameState.users?.find(u => u._id === tp.userId))
                                .filter(Boolean);

                            return (
                                <div key={team._id} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                                    <h3 className="text-lg font-bold text-blue-300 mb-3 flex justify-between">
                                        {team.name}
                                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 font-normal">
                                            Score: {team.score}
                                        </span>
                                    </h3>
                                    <div className="space-y-2">
                                        {teamMembers.map((member: any) => (
                                            <div key={member._id} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-900/50 p-2 rounded">
                                                <div className={`w-2 h-2 rounded-full ${member.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {member.nickname}
                                                {member.role === UserRole.ADMIN && <Crown size={12} className="text-yellow-500" />}
                                            </div>
                                        ))}
                                        {teamMembers.length === 0 && (
                                            <p className="text-gray-600 text-xs italic">Empty team</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {(!gameState.teams || gameState.teams.length === 0) && (
                            <p className="text-gray-500 col-span-full text-center py-10">
                                No teams created yet. Admin should create teams.
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
