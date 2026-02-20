import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { createTeam, assignPlayerToTeam, removePlayerFromTeam, startGame } from '../api/endpoints';
import { UserRole, GameStatus } from '../types';
import { Users, Crown, Play, Plus, X } from 'lucide-react';
import clsx from 'clsx';


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

    const currentUser = gameState.users?.find(u => u._id === userId);
    const isAdmin = currentUser?.role === UserRole.ADMIN;


    // Accessing teamPlayers from gameState (assuming it exists in response)
    const allTeamPlayers = (gameState as any).teamPlayers || [];

    const playersInTeams = new Set(allTeamPlayers.map((tp: any) => tp.userId));
    const trulyUnassigned = gameState.users?.filter(u => !playersInTeams.has(u._id)) || [];

    // Validation: At least 2 teams, and each team must have at least 2 players
    const canStartGame = (gameState.teams?.length || 0) >= 2 &&
        gameState.teams?.every(team => {
            const teamSize = allTeamPlayers.filter((tp: any) => tp.teamId === team._id).length;
            return teamSize >= 2;
        });


    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gameId || !newTeamName) return;
        try {
            await createTeam(gameId, newTeamName);
            setNewTeamName('');
            // Immediately refresh game state to show the new team
            await fetchGame(gameId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssign = async (teamId: string, userId: string) => {
        try {
            await assignPlayerToTeam(teamId, userId);
            // Immediately refresh game state to show the updated team assignment
            if (gameId) {
                await fetchGame(gameId);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemove = async (teamId: string, userId: string) => {
        try {
            await removePlayerFromTeam(teamId, userId);
            if (gameId) {
                await fetchGame(gameId);
            }
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
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header: Fixed Top */}
            <header className="relative z-10 bg-slate-900/50 backdrop-blur-md border-b border-white/5 p-4 sm:p-6 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-center sm:text-left">
                        <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
                            <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter italic text-white leading-none">
                                Lobby
                            </h1>
                            <div className="h-4 w-px bg-white/20" />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Code</span>
                                <span className="text-lg font-black text-blue-400 tracking-widest">{gameState.code}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="flex -space-x-2">
                            {gameState.users?.slice(0, 5).map((u, i) => (
                                <div key={u._id} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black" style={{ zIndex: 10 - i }}>
                                    {u.nickname.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {gameState.users && gameState.users.length > 5 && (
                                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black z-0">
                                    +{gameState.users.length - 5}
                                </div>
                            )}
                        </div>

                        {isAdmin && (
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={handleStartGame}
                                    disabled={!canStartGame}
                                    className={clsx(
                                        "px-8 py-2.5 rounded-2xl font-black flex items-center gap-2 transition-all uppercase tracking-widest text-xs",
                                        canStartGame
                                            ? "bg-white text-slate-900 hover:bg-blue-400 hover:text-white shadow-xl shadow-blue-500/20 active:scale-95"
                                            : "bg-white/5 text-white/20 cursor-not-allowed grayscale"
                                    )}
                                >
                                    <Play size={16} fill="currentColor" /> Start Match
                                </button>
                                {!canStartGame && (
                                    <span className="text-[9px] text-white/30 uppercase mt-1 tracking-tighter">
                                        Need 2+ teams with 2+ players
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content: Scrollable Centered Layout */}
            <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 sm:p-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 sm:gap-12">

                    {/* Left Column: Waiting Area - The "Bench" */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                                <Users size={14} className="text-blue-500" /> Waiting Area
                            </h2>
                            <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-md text-white/60">
                                {trulyUnassigned.length}
                            </span>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-4 sm:p-6 space-y-3 min-h-[100px] shadow-2xl">
                            {trulyUnassigned.map(user => (
                                <div key={user._id} className="group bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex justify-between items-center transition-all animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                        <span className="font-bold flex items-center gap-2 text-white/90">
                                            {user.nickname}
                                            {user.role === UserRole.ADMIN && <Crown size={12} className="text-yellow-500" />}
                                        </span>
                                    </div>

                                    {isAdmin && gameState.teams && gameState.teams.length > 0 && (
                                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                            {gameState.teams.map(team => (
                                                <button
                                                    key={team._id}
                                                    onClick={() => handleAssign(team._id, user._id)}
                                                    className="text-[10px] font-black bg-blue-600 hover:bg-blue-500 px-2 py-1.5 rounded-lg transition-colors uppercase"
                                                >
                                                    {team.name.substring(0, 2)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {trulyUnassigned.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest italic">All players ready</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center/Right Column: Teams Grid */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">The Squads</h2>
                            {isAdmin && (
                                <form onSubmit={handleCreateTeam} className="w-full sm:w-auto flex bg-white/5 rounded-2xl p-1 border border-white/5 focus-within:border-blue-500/50 transition-all">
                                    <input
                                        type="text"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        placeholder="Add Team..."
                                        className="bg-transparent border-none px-4 py-2 outline-none text-sm font-bold placeholder-white/20 flex-1 sm:w-48"
                                    />
                                    <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                                        <Plus size={18} />
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                            {gameState.teams?.map((team, idx) => {
                                const teamMembers = allTeamPlayers
                                    .filter((tp: any) => tp.teamId === team._id)
                                    .map((tp: any) => gameState.users?.find(u => u._id === tp.userId))
                                    .filter(Boolean);

                                return (
                                    <div key={team._id} className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 flex flex-col shadow-2xl transition-transform hover:scale-[1.01] animate-in zoom-in duration-500" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        {/* Team Header */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Team</span>
                                                <h3 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase">{team.name}</h3>
                                            </div>
                                            <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex flex-col items-center">
                                                <span className="text-[8px] font-black text-white/40 uppercase leading-none mb-1">Score</span>
                                                <span className="text-xl font-black font-mono leading-none">{team.score}</span>
                                            </div>
                                        </div>

                                        {/* Members List */}
                                        <div className="flex-1 space-y-3">
                                            {teamMembers.map((member: any) => (
                                                <div key={member._id} className="group/member flex items-center justify-between bg-white/5 p-4 rounded-[1.5rem] border border-transparent hover:border-white/10 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className={clsx(
                                                            "w-2.5 h-2.5 rounded-full border-2 border-slate-900",
                                                            member.isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'
                                                        )} />
                                                        <span className="font-bold text-white/80">{member.nickname}</span>
                                                        {member.role === UserRole.ADMIN && <Crown size={12} className="text-yellow-500" />}
                                                    </div>

                                                    {isAdmin && (
                                                        <div className="opacity-0 group-hover/member:opacity-100 flex gap-2 transition-opacity">
                                                            {gameState.teams?.filter(t => t._id !== team._id).map(otherTeam => (
                                                                <button
                                                                    key={otherTeam._id}
                                                                    onClick={() => handleAssign(otherTeam._id, member._id)}
                                                                    className="text-[9px] font-black bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg text-white/40 hover:text-white uppercase tracking-tighter"
                                                                    title={`Move to ${otherTeam.name}`}
                                                                >
                                                                    {otherTeam.name.substring(0, 2)}
                                                                </button>
                                                            ))}
                                                            <button
                                                                onClick={() => handleRemove(team._id, member._id)}
                                                                className="p-1.5 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                                                                title="Kick from team"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {teamMembers.length === 0 && (
                                                <div className="py-8 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Recruiting...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {(!gameState.teams || gameState.teams.length === 0) && (
                                <div className="col-span-full py-20 bg-white/5 border border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                                        <Plus size={32} className="text-blue-400" />
                                    </div>
                                    <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Create teams to start the match</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
