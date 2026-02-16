/**
 * Frontend State Models
 */

export type ObjectId = string;

export const GameStatus = {
    LOBBY: 'LOBBY',
    PLAYING: 'PLAYING',
    FINISHED: 'FINISHED',
} as const;
export type GameStatus = typeof GameStatus[keyof typeof GameStatus];

export const UserRole = {
    ADMIN: 'ADMIN',
    PLAYER: 'PLAYER',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const RoundStatus = {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
} as const;
export type RoundStatus = typeof RoundStatus[keyof typeof RoundStatus];

export const TurnStatus = {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
} as const;
export type TurnStatus = typeof TurnStatus[keyof typeof TurnStatus];

export interface UserState {
    _id: ObjectId;
    nickname: string;
    role: UserRole;
    gameId: ObjectId;
    isConnected: boolean;
    createdAt: string; // ISO Date string
}

export interface TeamState {
    _id: ObjectId;
    gameId: ObjectId;
    name: string;
    score: number;
    order: number;
}

export interface TeamPlayerState {
    _id: ObjectId;
    teamId: ObjectId;
    userId: ObjectId;
}

export interface RoundState {
    _id: ObjectId;
    gameId: ObjectId;
    roundNumber: number;
    status: RoundStatus;
}

export interface TurnState {
    _id: ObjectId;
    roundId: ObjectId;
    teamId: ObjectId;
    describerId: ObjectId;
    words: string[];
    solvedWords: string[];
    startTime: string; // ISO Date string
    duration: number; // Seconds
    status: TurnStatus;
}

export interface GuessState {
    _id: ObjectId;
    turnId: ObjectId;
    userId: ObjectId;
    input: string;
    points: number;
    createdAt: string; // ISO Date string
}

export interface GameState {
    _id: ObjectId;
    code: string;
    adminId: ObjectId;
    status: GameStatus;
    language: 'EN';
    maxPlayers: number;
    winningScore: number;
    currentRound: number;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string

    // Populated data often returned by GET /games/:gameId
    users?: UserState[];
    teams?: TeamState[];
    rounds?: RoundState[];
    turns?: TurnState[]; // Likely relevant to current round
    // Add optional teamPlayers for fuller typing if backend sends it flat
    teamPlayers?: TeamPlayerState[];
}
