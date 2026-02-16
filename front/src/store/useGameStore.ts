import { create } from 'zustand';
import type { GameState } from '../types';
import { getGame } from '../api/endpoints';

interface GameStore {
    gameState: GameState | null;
    userId: string | null;
    isLoading: boolean;
    error: string | null;

    setUserId: (id: string) => void;
    setGameState: (state: GameState) => void;
    fetchGame: (gameId: string) => Promise<void>;
    reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
    gameState: null,
    userId: localStorage.getItem('userId'),
    isLoading: false,
    error: null,

    setUserId: (id) => {
        localStorage.setItem('userId', id);
        set({ userId: id });
    },

    setGameState: (state) => set({ gameState: state }),

    fetchGame: async (gameId) => {
        try {
            const response = await getGame(gameId);
            set({ gameState: response.data, error: null });
        } catch (err: any) {
            console.error('Failed to fetch game:', err);
            set({ error: err.message || 'Failed to sync game state' });
        }
    },

    reset: () => {
        localStorage.removeItem('userId');
        set({ gameState: null, userId: null, error: null });
    },
}));
