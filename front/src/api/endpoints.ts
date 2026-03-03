import { apiClient } from './client';
import type { GameState } from '../types';

// Game Management
export const createGame = async (nickname: string, maxPlayers = 10, language = 'EN') => {
    return apiClient.post<{ gameId: string; userId: string } & GameState>('/games', {
        nickname,
        maxPlayers,
        language,
    });
};

export const joinGame = async (gameId: string, nickname: string) => {
    return apiClient.post<{ userId: string } & GameState>(`/games/${gameId}/join`, {
        nickname,
    });
};

export const getGame = async (gameId: string) => {
    //console.log("gameId", gameId);
    return apiClient.get<GameState>(`/games/${gameId}`);
};

export const restartGame = async (gameId: string) => {
    return apiClient.post(`/games/${gameId}/restart`);
};

// Lobby Actions
export const createTeam = async (gameId: string, name: string) => {
    return apiClient.post(`/games/${gameId}/teams`, { name });
};

export const assignPlayerToTeam = async (teamId: string, userId: string) => {
    return apiClient.post(`/teams/${teamId}/assign`, { userId });
};

export const removePlayerFromTeam = async (teamId: string, userId: string) => {
    return apiClient.post(`/teams/${teamId}/remove`, { userId });
};

export const startGame = async (gameId: string) => {
    return apiClient.post(`/games/${gameId}/start`);
};

// Gameplay
export const createRound = async (gameId: string) => {
    return apiClient.post(`/games/${gameId}/rounds`);
};

export const startTurn = async (roundId: string) => {
    return apiClient.post(`/rounds/${roundId}/turns/start`);
};

export const submitGuess = async (turnId: string, input: string) => {
    return apiClient.post(`/turns/${turnId}/guess`, { input });
};

export const endTurn = async (turnId: string) => {
    return apiClient.post(`/turns/${turnId}/end`);
};

export const kickPlayer = async (gameId: string, playerId: string) => {
    return apiClient.post<{ message: string; gameStatus: string }>(`/games/${gameId}/kick`, { playerId });
};

export const deleteTeam = async (gameId: string, teamId: string) => {
    return apiClient.post<{ message: string; gameStatus: string }>(`/games/${gameId}/delete-team`, { teamId });
};

