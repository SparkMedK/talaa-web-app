import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { createRound, startTurn, submitGuess, restartGame, endTurn } from '../api/endpoints';
import { UserRole, RoundStatus, TurnStatus, GameStatus } from '../types';
import { Timer, Send, Play, RotateCcw, CheckCircle2, Square } from 'lucide-react';

import clsx from 'clsx';

export const Game: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();

    const { gameState, userId, fetchGame } = useGameStore();
    const [guessInput, setGuessInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    // Polling
    useEffect(() => {
        if (!gameId) return;
        fetchGame(gameId);
        const interval = setInterval(() => fetchGame(gameId), 1000); // 1s polling for game loop
        return () => clearInterval(interval);
    }, [gameId, fetchGame]);

    // Redirect to lobby if game is reset
    useEffect(() => {
        if (gameState?.status === GameStatus.LOBBY) {
            navigate(`/lobby/${gameId}`);
        }
    }, [gameState?.status, gameId, navigate]);

    // Timer logic - derived from turn state
    useEffect(() => {
        if (!gameState?.turns || gameState.turns.length === 0) return;
        const currentTurn = gameState.turns[gameState.turns.length - 1];

        if (currentTurn?.status === TurnStatus.ACTIVE && currentTurn.startTime) {
            const endTime = new Date(currentTurn.startTime).getTime() + (currentTurn.duration * 1000);
            const updateTimer = () => {
                const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
                setTimeLeft(remaining);
            };

            updateTimer();
            const timerInt = setInterval(updateTimer, 500);
            return () => clearInterval(timerInt);
        } else {
            setTimeLeft(0);
        }
    }, [gameState]);

    if (!gameState) return <div className="text-white text-center mt-20">Loading Game...</div>;

    const isAdmin = gameState.users?.find(u => u._id === userId)?.role === UserRole.ADMIN;

    // Derived state
    const currentRound = gameState.rounds?.find(r => r.roundNumber === gameState.currentRound);
    const currentTurn = gameState.turns?.find(t => t.roundId === currentRound?._id && t.status === TurnStatus.ACTIVE);
    const latestTurn = gameState.turns && gameState.turns.length > 0 ? gameState.turns[gameState.turns.length - 1] : null;


    // Assume generic flat list for now or we rely on backend populated data structure
    const allTeamPlayers = (gameState as any).teamPlayers || [];
    const myTeamId = allTeamPlayers.find((tp: any) => tp.userId === userId)?.teamId;

    const isMyTeamTurn = currentTurn?.teamId === myTeamId;
    const isDescriber = currentTurn?.describerId === userId;

    const handleCreateRound = async () => {
        if (!gameId) return;
        try { await createRound(gameId); } catch (e) { console.error(e); }
    };

    const handleStartTurn = async () => {
        if (!currentRound) return;
        try { await startTurn(currentRound._id); } catch (e) { console.error(e); }
    };

    const handleGuess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTurn || !guessInput.trim()) return;
        try {
            await submitGuess(currentTurn._id, guessInput);
            setGuessInput('');
        } catch (e) { console.error(e); }
    };

    const handleManualSolve = async (word: string) => {
        if (!currentTurn) return;
        try {
            await submitGuess(currentTurn._id, word);
        } catch (e) { console.error(e); }
    };

    const handleEndTurn = async () => {
        if (!currentTurn) return;
        try {
            await endTurn(currentTurn._id);
        } catch (e) { console.error(e); }
    };


    const handleResetGame = async () => {
        if (!gameId) return;
        if (confirm('Are you sure you want to RESET the entire game? Teams and scores will be cleared.')) {
            try { await restartGame(gameId); } catch (e) { console.error(e); }
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Top Bar: Scoreboard */}
            <header className="bg-gray-800 border-b border-gray-700 p-4 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-blue-400">Round {gameState.currentRound || 0}</h1>
                        {isAdmin && (
                            <button onClick={handleResetGame} className="p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20" title="Reset Game (Admin Only)">
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto">
                        {gameState.teams?.map(team => (
                            <div
                                key={team._id}
                                className={clsx(
                                    "px-4 py-2 rounded-lg border flex flex-col items-center min-w-[100px]",
                                    currentTurn?.teamId === team._id ? "bg-blue-900/40 border-blue-500 shadow-blue-500/20 shadow-lg" : "bg-gray-700 border-gray-600"
                                )}
                            >
                                <span className="font-bold text-sm truncate max-w-[120px]">{team.name}</span>
                                <span className="text-2xl font-mono">{team.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Game Area */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center items-center gap-8">

                {/* Timer */}
                {currentTurn && (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className={clsx(
                            "text-6xl font-mono font-bold flex items-center gap-2 transition-colors",
                            timeLeft < 10 ? "text-red-500" : "text-white"
                        )}>
                            <Timer size={48} />
                            {timeLeft}s
                        </div>
                    </div>
                )}

                {/* Game State Messages */}
                <div className="w-full max-w-2xl bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 min-h-[300px] flex flex-col items-center justify-center">

                    {/* Case: No Active Round */}
                    {!currentRound && (gameState.currentRound === 0 || gameState.rounds?.every(r => r.status === RoundStatus.COMPLETED)) && (
                        <div className="text-center">
                            <h2 className="text-2xl mb-4">Round Ended or Not Started</h2>
                            {isAdmin ? (
                                <button
                                    onClick={handleCreateRound}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 mx-auto"
                                >
                                    <Play size={24} /> Start New Round
                                </button>
                            ) : (
                                <p className="text-gray-400">Waiting for admin to start round...</p>
                            )}
                        </div>
                    )}

                    {/* Case: Active Round, No Active Turn */}
                    {currentRound && !currentTurn && (
                        <div className="text-center">
                            <h2 className="text-xl mb-4">
                                {latestTurn ? "Turn Ended" : `Round ${currentRound.roundNumber} Started`}
                            </h2>
                            {(() => {
                                if (!gameState.teams || gameState.teams.length === 0) return null;
                                // Find next team in rotation
                                const sortedTeams = [...gameState.teams].sort((a, b) => (a.order || 0) - (b.order || 0));
                                let nextTeamId = sortedTeams[0]._id;

                                if (latestTurn) {
                                    const lastTeamIndex = sortedTeams.findIndex(t => t._id === latestTurn.teamId);
                                    const nextIndex = (lastTeamIndex + 1) % sortedTeams.length;
                                    nextTeamId = sortedTeams[nextIndex]._id;
                                }

                                // Find next describer for that team using the same logic as backend
                                const teamMembers = (gameState as any).teamPlayers
                                    ?.filter((tp: any) => tp.teamId === nextTeamId)
                                    .sort((a: any, b: any) => a._id.localeCompare(b._id)) || [];

                                const completedTurnsCount = gameState.turns?.filter(
                                    t => t.teamId === nextTeamId && t.status === TurnStatus.COMPLETED
                                ).length || 0;

                                const describerIndex = teamMembers.length > 0 ? completedTurnsCount % teamMembers.length : 0;
                                const nextDescriberId = teamMembers[describerIndex]?.userId;
                                const nextDescriberNickname = gameState.users?.find(u => u._id === nextDescriberId)?.nickname || "the describer";

                                const isMyTurnToStart = userId === nextDescriberId;
                                const isMyTeamToStart = myTeamId === nextTeamId;

                                if (isMyTeamToStart) {
                                    return (
                                        <div className="space-y-4">
                                            {isMyTurnToStart ? (
                                                <p className="text-yellow-400 font-bold animate-pulse">It's YOUR turn to describe!</p>
                                            ) : (
                                                <p className="text-blue-400 font-bold animate-pulse">It's your team's turn! <span className="text-white">{nextDescriberNickname}</span> will be describing.</p>
                                            )}
                                            <button
                                                onClick={handleStartTurn}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95"
                                            >
                                                <Play size={24} /> Start Round
                                            </button>
                                        </div>
                                    );
                                }

                                const nextTeamName = gameState.teams.find(t => t._id === nextTeamId)?.name;
                                return (
                                    <p className="text-gray-400">
                                        Waiting for <span className="text-blue-400 font-bold">{nextDescriberNickname}</span> ({nextTeamName}) to start...
                                    </p>
                                );
                            })()}



                            {latestTurn && latestTurn.words && (
                                <div className="mt-8 text-sm text-gray-400">
                                    <p className="mb-2">Last turn words:</p>
                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {latestTurn.words.map((w, i) => (
                                            <span key={i} className={clsx(
                                                "px-2 py-1 rounded",
                                                latestTurn.solvedWords.includes(w) ? "bg-green-900 text-green-300 line-through" : "bg-red-900 text-red-300"
                                            )}>{w}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Case: Active Turn */}
                    {currentTurn && (
                        <div className="w-full text-center">
                            {(() => {
                                const describer = gameState.users?.find(u => u._id === currentTurn.describerId);
                                const describerName = describer?.nickname || "Someone";

                                return isMyTeamTurn ? (
                                    isDescriber ? (
                                        <div className="space-y-6">
                                            <div className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full inline-block font-bold mb-4">
                                                YOU ({describerName}) ARE DESCRIBING
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {currentTurn.words.map((word, idx) => {
                                                    const isSolved = currentTurn.solvedWords.includes(word);
                                                    return (
                                                        <button
                                                            key={idx}
                                                            disabled={isSolved || timeLeft === 0}
                                                            onClick={() => handleManualSolve(word)}
                                                            className={clsx(
                                                                "p-4 rounded-xl text-xl font-bold border-2 transition-all flex items-center justify-between gap-2",
                                                                isSolved
                                                                    ? "bg-green-600/20 border-green-500 text-green-400 scale-95 opacity-50"
                                                                    : "bg-white text-gray-900 border-white shadow-lg scale-100 hover:scale-105 active:scale-95"
                                                            )}
                                                        >
                                                            <span>{word}</span>
                                                            {isSolved && <CheckCircle2 className="text-green-500" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            {timeLeft === 0 ? (
                                                <button
                                                    onClick={handleEndTurn}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 mx-auto mt-8 animate-bounce"
                                                >
                                                    <Square size={24} /> End Turn
                                                </button>
                                            ) : (
                                                <p className="text-sm text-gray-400 mt-4">Describe these words to your team without saying them!</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-6 max-w-md mx-auto">
                                            <div className="flex flex-col items-center gap-2 mb-4">
                                                <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full inline-block font-bold">
                                                    GUESS THE WORDS!
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    <span className="font-bold text-blue-400">{describerName}</span> is describing...
                                                </div>
                                            </div>
                                            <form onSubmit={handleGuess} className="relative">
                                                <input
                                                    type="text"
                                                    value={guessInput}
                                                    onChange={(e) => setGuessInput(e.target.value)}
                                                    placeholder="Type your guess here..."
                                                    className="w-full bg-gray-700 border-2 border-blue-500 rounded-full py-4 px-6 pr-14 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/20 text-lg transition-all"
                                                    autoFocus
                                                />
                                                <button
                                                    type="submit"
                                                    className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full transition-colors aspect-square flex items-center justify-center"
                                                >
                                                    <Send size={20} />
                                                </button>
                                            </form>
                                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                                                {currentTurn.solvedWords.map((w, i) => (
                                                    <span key={i} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                                                        {w}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold text-gray-300">
                                            {gameState.teams?.find(t => t._id === currentTurn.teamId)?.name} is playing...
                                        </h2>
                                        <div className="text-lg text-blue-400 font-medium">
                                            <span className="text-gray-400">Describer:</span> {describerName}
                                        </div>
                                        <div className="animate-spin text-gray-600 mx-auto w-fit">
                                            <RotateCcw size={40} />
                                        </div>
                                        <div className="flex gap-2 justify-center mt-8">
                                            {currentTurn.solvedWords.map((_, i) => (
                                                <span key={i} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                                                    Solved 1 word
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}


                </div>
            </main>
        </div>
    );
};
