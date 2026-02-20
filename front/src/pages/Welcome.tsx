import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, joinGame } from '../api/endpoints';
import { useGameStore } from '../store/useGameStore';
import { Gamepad2, Users, Play } from 'lucide-react';
import clsx from 'clsx';

export const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const setUserId = useGameStore((state) => state.setUserId);
    const setGameState = useGameStore((state) => state.setGameState);

    const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
    const [nickname, setNickname] = useState('');
    const [gameIdToJoin, setGameIdToJoin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname) return;
        setLoading(true);
        setError(null);
        try {
            const response = await createGame(nickname);
            const data = response.data;
            setUserId(data.userId);
            setGameState(data as any);
            navigate(`/lobby/${data._id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create game');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname || !gameIdToJoin) return;
        setLoading(true);
        setError(null);
        try {
            const response = await joinGame(gameIdToJoin, nickname);
            const data = response.data;
            setUserId(data.userId);
            setGameState(data as any);
            navigate(`/lobby/${data._id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to join game');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in duration-700">
                {/* Brand / Logo Section */}
                <div className="text-center mb-12">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse" />
                        <h1 className="relative text-6xl sm:text-8xl font-black italic tracking-tighter italic text-white leading-none">
                            Tallaa
                        </h1>
                    </div>
                    <div className="mt-4 flex flex-col items-center">
                        <div className="h-px w-12 bg-blue-500/50 mb-3" />
                        <p className="text-white/40 text-sm sm:text-base font-bold uppercase tracking-[0.4em]">
                            Multiplayer Word Game
                        </p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-blue-500/5">
                    {/* Tabs */}
                    <div className="flex p-2 gap-2 bg-white/5 mx-6 mt-6 rounded-2xl">
                        <button
                            onClick={() => { setActiveTab('create'); setError(null); }}
                            className={clsx(
                                "flex-1 py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest",
                                activeTab === 'create'
                                    ? "bg-white text-slate-900 shadow-xl"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Gamepad2 size={16} /> Create
                        </button>
                        <button
                            onClick={() => { setActiveTab('join'); setError(null); }}
                            className={clsx(
                                "flex-1 py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest",
                                activeTab === 'join'
                                    ? "bg-white text-slate-900 shadow-xl"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Users size={16} /> Join
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 sm:p-10">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center animate-in shake duration-500">
                                {error}
                            </div>
                        )}

                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'create' ? (
                                <form onSubmit={handleCreateGame} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Your Nickname</label>
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:border-blue-500 focus:bg-white/10 outline-none text-white text-lg font-bold transition-all"
                                            placeholder="e.g. Speedster"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>GET STARTED <Play size={20} fill="currentColor" /></>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleJoinGame} className="space-y-6">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Your Nickname</label>
                                            <input
                                                type="text"
                                                value={nickname}
                                                onChange={(e) => setNickname(e.target.value)}
                                                className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:border-blue-500 focus:bg-white/10 outline-none text-white text-lg font-bold transition-all"
                                                placeholder="e.g. GuesserPro"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Game Invite Code</label>
                                            <input
                                                type="text"
                                                value={gameIdToJoin}
                                                onChange={(e) => setGameIdToJoin(e.target.value)}
                                                className="w-full px-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl focus:border-blue-500 focus:bg-white/10 outline-none text-white text-xl font-mono font-black tracking-widest transition-all"
                                                placeholder="CODE..."
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>JOIN GAME <Users size={20} /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-white/20 text-xs font-bold uppercase tracking-[0.3em]">
                    Build for fun & speed
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .shake { animation: shake 0.4s ease-in-out; }
            `}} />
        </div>
    );
};
