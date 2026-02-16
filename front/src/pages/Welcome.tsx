import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, joinGame } from '../api/endpoints';
import { useGameStore } from '../store/useGameStore';
import { Gamepad2, Users } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gray-700 p-6 text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Tallaa
                    </h1>
                    <p className="text-gray-400 mt-2">Multiplayer Word Guessing Game</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={clsx(
                            "flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                            activeTab === 'create' ? "bg-gray-800 text-blue-400 border-b-2 border-blue-400" : "bg-gray-750 text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <Gamepad2 size={18} /> Create Game
                    </button>
                    <button
                        onClick={() => setActiveTab('join')}
                        className={clsx(
                            "flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                            activeTab === 'join' ? "bg-gray-800 text-purple-400 border-b-2 border-purple-400" : "bg-gray-750 text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <Users size={18} /> Join Game
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {activeTab === 'create' ? (
                        <form onSubmit={handleCreateGame} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nickname</label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create New Game'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinGame} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nickname</label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Game ID</label>
                                <input
                                    type="text"
                                    value={gameIdToJoin}
                                    onChange={(e) => setGameIdToJoin(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                                    placeholder="e.g. TR4X2Z"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Joining...' : 'Join Existing Game'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
