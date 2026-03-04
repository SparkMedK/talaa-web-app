import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { createRound, startTurn, submitGuess, restartGame, endTurn, kickPlayer } from '../api/endpoints';
import { UserRole, RoundStatus, TurnStatus, GameStatus } from '../types';
import { Timer, Send, Play, RotateCcw, CheckCircle2, Square, UserMinus } from 'lucide-react';

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

    // Redirect if kicked
    useEffect(() => {
        if (gameState && userId && !gameState.users?.some(u => u._id === userId)) {
            navigate('/');
        }
    }, [gameState, userId, navigate]);

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

    const isFinished = gameState.status === GameStatus.FINISHED;
    const sortedTeams = gameState.teams ? [...gameState.teams].sort((a, b) => b.score - a.score) : [];
    const winner = sortedTeams[0];
    const maxScore = sortedTeams.length > 0 ? sortedTeams[0].score : 0;
    const isTieBreak = !isFinished && maxScore >= (gameState.winningScore || 20);


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

    const handleKickDescriber = async (describerId: string) => {
        if (!gameId) return;
        if (confirm('Kick the upcoming describer from the game? Their team may be dissolved if it falls below 2 players.')) {
            try {
                await kickPlayer(gameId, describerId);
                await fetchGame(gameId);
            } catch (e: any) {
                alert(e?.response?.data?.message || 'Failed to kick player.');
            }
        }
    };



    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Top Bar: Scoreboard - Thinner and more elegant */}
            <header className="relative z-10 bg-slate-900/50 backdrop-blur-md border-b border-white/5 p-3 sm:p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center px-2">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className={clsx(
                                    "text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-500",
                                    isTieBreak ? "text-orange-500 animate-pulse" : "text-blue-400"
                                )}>
                                    {isTieBreak ? "Tie Breaker" : "Round"}
                                </span>
                                <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter leading-none">{gameState.currentRound || 1}</h1>
                            </div>
                            <div className="h-8 w-[1px] bg-white/10" />
                            <div className="flex flex-col">
                                <span className={clsx(
                                    "text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-500",
                                    isTieBreak ? "text-orange-500 animate-pulse" : "text-yellow-500"
                                )}>
                                    Target
                                </span>
                                <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter leading-none">{gameState.winningScore || 20}</h1>
                            </div>
                        </div>
                        {isAdmin && (
                            <button onClick={handleResetGame} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all active:scale-95" title="Reset Game">
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 sm:gap-4 items-center max-w-[60%] sm:max-w-none">
                        {gameState.teams?.map(team => (
                            <div
                                key={team._id}
                                className={clsx(
                                    "relative group px-3 py-1.5 sm:px-5 sm:py-2 rounded-2xl border transition-all duration-500 flex flex-col items-center min-w-[70px] sm:min-w-[100px]",
                                    currentTurn?.teamId === team._id
                                        ? "bg-blue-500/20 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-105"
                                        : "bg-white/5 border-white/5 opacity-60"
                                )}
                            >
                                <span className="font-extrabold text-[9px] sm:text-[10px] uppercase tracking-widest truncate max-w-[60px] sm:max-w-[100px] mb-0.5">{team.name}</span>
                                <span className={clsx(
                                    "text-lg sm:text-2xl font-black font-mono leading-none transition-colors duration-500",
                                    team.score >= gameState.winningScore ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-white"
                                )}>
                                    {team.score}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content: Full Centered Layout */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full">

                {/* 1. Timer - Only show if not finished */}
                {!isFinished && (
                    <div className="mb-4 sm:mb-8 flex flex-col items-center">
                        <div className={clsx(
                            "relative flex items-center justify-center",
                            currentTurn ? "scale-100 opacity-100" : "scale-75 opacity-20 transition-all duration-700"
                        )}>
                            {/* Circular Progress (Simplified Visual) */}
                            <div className={clsx(
                                "absolute inset-0 rounded-full border-4 opacity-20",
                                timeLeft < 10 ? "border-red-500" : "border-blue-500"
                            )} />

                            <div className={clsx(
                                "text-6xl sm:text-8xl font-black font-mono flex items-center gap-2 tabular-nums transition-colors duration-300",
                                timeLeft < 10 ? "text-red-500 animate-pulse" : "text-white"
                            )}>
                                {timeLeft}
                                <span className="text-xl sm:text-2xl text-white/40 font-sans tracking-tight ml-[-4px]">s</span>
                            </div>
                        </div>
                        {/* Active Team Label */}
                        {currentTurn && (
                            <div className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-blue-400/80">
                                {gameState.teams?.find(t => t._id === currentTurn.teamId)?.name} Team
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Content Area - Roles and gameplay OR Finished view */}
                <div className="w-full flex flex-col items-center gap-6 sm:gap-10">
                    {isFinished ? (
                        <div className="w-full max-w-2xl text-center flex flex-col items-center animate-in fade-in zoom-in duration-1000">
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter mb-4 relative z-10">
                                    🎉 {winner?.name.toUpperCase()} WINS!
                                </h1>
                                <p className="text-blue-400 font-extrabold tracking-[0.5em] text-sm uppercase relative z-10">
                                    Final Standings
                                </p>
                            </div>

                            <div className="w-full space-y-4 mb-12">
                                {sortedTeams.map((team, index) => (
                                    <div
                                        key={team._id}
                                        className={clsx(
                                            "flex items-center justify-between p-6 rounded-[2rem] border transition-all",
                                            index === 0
                                                ? "bg-yellow-400/10 border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.1)] scale-105"
                                                : "bg-white/5 border-white/5 shadow-xl"
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className={clsx(
                                                "text-2xl font-black font-mono w-10 h-10 flex items-center justify-center rounded-full",
                                                index === 0 ? "bg-yellow-400 text-black" : "bg-white/10 text-white"
                                            )}>
                                                {index + 1}
                                            </span>
                                            <span className="text-2xl font-black">{team.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-3xl font-black font-mono">{team.score}</span>
                                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Points</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={handleResetGame}
                                    className="group relative bg-white text-black hover:bg-blue-600 hover:text-white px-12 py-6 rounded-3xl font-black text-2xl flex items-center gap-4 transition-all shadow-2xl hover:shadow-blue-600/40 active:scale-95 duration-300"
                                >
                                    <RotateCcw size={28} className="group-hover:rotate-[-180deg] transition-all duration-700" /> RESTART GAME
                                </button>
                            )}

                            {!isAdmin && (
                                <div className="flex flex-col items-center gap-4 text-white/40 italic">
                                    <RotateCcw size={32} className="animate-spin-slow opacity-20" />
                                    <p className="font-bold tracking-widest uppercase text-sm">Waiting for admin to restart...</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Case: No Active Round (Admin UI or Waiting) */}
                            {!currentRound && (gameState.currentRound === 0 || gameState.rounds?.every(r => r.status === RoundStatus.COMPLETED)) && (
                                <div className="text-center animate-in fade-in zoom-in duration-500">
                                    <h2 className="text-3xl sm:text-5xl font-black mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent italic">
                                        Ready for the next round?
                                    </h2>
                                    {isAdmin ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <button
                                                onClick={handleCreateRound}
                                                className="group relative bg-white text-black hover:bg-blue-400 hover:text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 mx-auto transition-all shadow-2xl hover:shadow-blue-500/40 active:scale-95"
                                            >
                                                <Play size={28} fill="currentColor" /> START NEW ROUND
                                            </button>
                                            <button
                                                onClick={handleResetGame}
                                                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-black uppercase tracking-[0.2em]"
                                            >
                                                <RotateCcw size={16} /> Back to Waiting Area
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-lg text-white/40 font-medium tracking-wide">WAITING FOR ADMIN...</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Case: Waiting for someone to start the turn */}
                            {currentRound && !currentTurn && (
                                <div className="w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    {(() => {
                                        if (!gameState.teams || gameState.teams.length === 0) return null;
                                        const sortedTeams = [...gameState.teams].sort((a, b) => (a.order || 0) - (b.order || 0));
                                        let nextTeamId = sortedTeams[0]._id;

                                        if (latestTurn) {
                                            const lastTeamIndex = sortedTeams.findIndex(t => t._id === latestTurn.teamId);
                                            const nextIndex = (lastTeamIndex + 1) % sortedTeams.length;
                                            nextTeamId = sortedTeams[nextIndex]._id;
                                        }

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

                                        return (
                                            <div className="flex flex-col items-center gap-8">
                                                <div className="space-y-2">
                                                    <h3 className="text-white/40 uppercase tracking-[0.4em] text-xs font-black">UP NEXT</h3>
                                                    <div className="text-2xl sm:text-4xl font-black">
                                                        {gameState.teams.find(t => t._id === nextTeamId)?.name}
                                                    </div>
                                                    {/* Admin: Kick the upcoming describer before their turn starts */}
                                                    {isAdmin && nextDescriberId && nextDescriberId !== userId && (
                                                        <div className="flex items-center justify-center gap-2 mt-3">
                                                            <span className="text-xs text-white/30 font-bold uppercase tracking-widest">Describer:</span>
                                                            <span className="text-sm font-bold text-white/70">{nextDescriberNickname}</span>
                                                            <button
                                                                onClick={() => handleKickDescriber(nextDescriberId)}
                                                                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 text-xs font-black uppercase tracking-wider transition-all active:scale-95 border border-red-500/20"
                                                                title={`Kick ${nextDescriberNickname} from the game`}
                                                            >
                                                                <UserMinus size={13} />
                                                                Kick
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {isMyTeamToStart ? (
                                                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] w-full backdrop-blur-xl shadow-2xl">
                                                        <div className="mb-8">
                                                            {isMyTurnToStart ? (
                                                                <div className="text-yellow-400 text-xl font-black italic tracking-tight">YOU ARE UP!</div>
                                                            ) : (
                                                                <div className="text-blue-400 text-lg font-bold">Your team is up!</div>
                                                            )}
                                                            <p className="text-white/60 mt-1">
                                                                <span className="text-white font-bold">{nextDescriberNickname}</span> will be describing.
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={handleStartTurn}
                                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98]"
                                                        >
                                                            <Play size={24} fill="currentColor" /> START YOUR TURN
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-4 text-white/40">
                                                        <div className="w-8 h-8 border-2 border-dotted border-white/20 rounded-full animate-spin" />
                                                        <p className="text-sm font-bold tracking-widest uppercase">
                                                            Waiting for <span className="text-white">{nextDescriberNickname}</span>...
                                                        </p>
                                                    </div>
                                                )}

                                                {latestTurn && latestTurn.words && (
                                                    <div className="pt-8 border-t border-white/5 w-full">
                                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 font-black">Previous Results</p>
                                                        <div className="flex gap-2 flex-wrap justify-center">
                                                            {latestTurn.words.map((w, i) => (
                                                                <span key={i} className={clsx(
                                                                    "px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all",
                                                                    latestTurn.solvedWords.includes(w)
                                                                        ? "bg-green-500/10 text-green-400 line-through decoration-2"
                                                                        : "bg-white/5 text-white/30"
                                                                )}>{w}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Case: Active Turn - The Main Event */}
                            {currentTurn && (
                                <div className="w-full flex flex-col items-center gap-8 sm:gap-12 max-w-3xl">
                                    {/* 2. Active Role Indicator - Centered and visible */}
                                    <div className="text-center">
                                        <div className={clsx(
                                            "inline-flex items-center gap-3 px-6 py-2 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl",
                                            isDescriber ? "bg-yellow-400 text-black" : "bg-blue-600 text-white"
                                        )}>
                                            {isDescriber ? (
                                                <><Send size={16} /> YOU ARE DESCRIBING</>
                                            ) : (
                                                <><Timer size={16} /> {isMyTeamTurn ? "GUESS THE WORDS!" : "OPPONENT PLAYING"}</>
                                            )}
                                        </div>
                                        {!isDescriber && (
                                            <div className="mt-3 text-white/50 text-sm font-medium">
                                                <span className="text-white font-bold">
                                                    {gameState.users?.find(u => u._id === currentTurn.describerId)?.nickname}
                                                </span> is describing
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Main Gameplay Area - Centered and Balanced */}
                                    <div className="w-full">
                                        {isDescriber ? (
                                            /* ------------------------------------------- */
                                            /* CASE A: DESCRIBER ROLE (Interactive Controls) */
                                            /* ------------------------------------------- */
                                            <div className="space-y-8">
                                                <div className="text-center space-y-2">
                                                    <h2 className="text-xl sm:text-2xl font-black text-yellow-400 uppercase tracking-tight">Active Describer</h2>
                                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Tap words as your team guesses them</p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                                                    {currentTurn.words.map((word, idx) => {
                                                        const isSolved = currentTurn.solvedWords.includes(word);
                                                        return (
                                                            <button
                                                                key={idx}
                                                                disabled={isSolved || timeLeft === 0}
                                                                onClick={() => handleManualSolve(word)}
                                                                className={clsx(
                                                                    "group relative p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] text-2xl sm:text-3xl font-black transition-all duration-300 flex items-center justify-between gap-4 overflow-hidden",
                                                                    isSolved
                                                                        ? "bg-green-500/10 border-2 border-green-500/20 text-green-500/40 scale-[0.97]"
                                                                        : "bg-white text-slate-900 border-2 border-white shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)] hover:scale-[1.03] active:scale-[0.98]"
                                                                )}
                                                            >
                                                                <span className="z-10">{word}</span>
                                                                {isSolved ? (
                                                                    <CheckCircle2 className="text-green-500 z-10" size={32} />
                                                                ) : (
                                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                                        <CheckCircle2 size={24} />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ) : isMyTeamTurn ? (
                                            /* ------------------------------------------- */
                                            /* CASE B: ACTIVE TEAM (GUESSER)               */
                                            /* ------------------------------------------- */
                                            <div className="flex flex-col items-center gap-10 w-full">
                                                <div className="w-full max-w-md space-y-4">
                                                    <div className="text-center">
                                                        <h2 className="text-xl font-black text-blue-400 uppercase tracking-tight">Your Team's Turn</h2>
                                                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Type your answers below</p>
                                                    </div>
                                                    <form onSubmit={handleGuess} className="w-full relative group">
                                                        <input
                                                            type="text"
                                                            value={guessInput}
                                                            onChange={(e) => setGuessInput(e.target.value)}
                                                            placeholder="Enter guess..."
                                                            className="w-full bg-white/10 border-2 border-white/10 backdrop-blur-xl rounded-[2rem] py-5 px-8 pr-16 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 focus:bg-white/15 text-xl sm:text-2xl font-bold transition-all shadow-2xl"
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-[1.2rem] transition-all flex items-center justify-center shadow-lg active:scale-90"
                                                        >
                                                            <Send size={24} />
                                                        </button>
                                                    </form>
                                                </div>


                                            </div>
                                        ) : (
                                            /* ------------------------------------------- */
                                            /* CASE C: SPECTATOR / WATCHING TURN           */
                                            /* ------------------------------------------- */
                                            <div className="flex flex-col items-center gap-8 w-full">
                                                {/* Distinguishing Spectator Banner */}
                                                <div className="w-full bg-purple-500/10 border border-purple-500/20 py-4 px-6 rounded-2xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Spectator Mode</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white/40 uppercase italic">View Only • No Interaction</span>
                                                </div>

                                                <div className="w-full bg-slate-900/60 border border-white/5 p-8 sm:p-12 rounded-[3.5rem] backdrop-blur-md shadow-2xl space-y-8">
                                                    <div className="text-center space-y-2">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Now Playing</span>
                                                        <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                                                            {gameState.teams?.find(t => t._id === currentTurn.teamId)?.name} Team
                                                        </h3>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {currentTurn.words.map((word, idx) => {
                                                            const isSolved = currentTurn.solvedWords.includes(word);
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={clsx(
                                                                        "p-6 rounded-[2rem] text-xl sm:text-2xl font-black transition-all duration-500 flex items-center justify-between gap-4 border-2",
                                                                        isSolved
                                                                            ? "bg-green-500/10 border-green-500/20 text-green-500/40"
                                                                            : "bg-white/5 border-white/10 text-white/80"
                                                                    )}
                                                                >
                                                                    <span>{word}</span>
                                                                    {isSolved && <CheckCircle2 size={24} className="text-green-500" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 4. Action Button - Clearly below and accessible */}
                                    {isDescriber && timeLeft === 0 && (
                                        <button
                                            onClick={handleEndTurn}
                                            className="w-full sm:w-auto min-w-[300px] bg-red-600 hover:bg-red-500 text-white px-10 py-6 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 transition-all shadow-[0_15px_35px_-5px_rgba(220,38,38,0.5)] animate-in slide-in-from-bottom-10 active:scale-95 duration-500"
                                        >
                                            <Square size={28} fill="currentColor" /> END YOUR TURN
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Bottom Safe Area Spacer for Mobile */}
            <footer className="h-6 sm:h-8 flex-shrink-0" />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}} />
        </div>
    );
};
