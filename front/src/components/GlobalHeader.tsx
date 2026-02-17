import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { User } from 'lucide-react';

export const GlobalHeader: React.FC = () => {
    const { gameState, userId } = useGameStore();

    if (!gameState || !userId) return null;

    const currentUser = gameState.users?.find(u => u._id === userId);
    if (!currentUser) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 px-4 py-2 rounded-full flex items-center gap-3 shadow-xl">
                <div className="bg-blue-500/20 p-1.5 rounded-full">
                    <User size={16} className="text-blue-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold leading-tight">Playing as</span>
                    <span className="text-sm font-bold text-white leading-tight">{currentUser.nickname}</span>
                </div>
            </div>
        </div>
    );
};
