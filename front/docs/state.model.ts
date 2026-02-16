/**
 * Frontend State Models
 * Mirrors backend schemas from `Back/docs/schemas.md`
 */

export type ObjectId = string;

export enum GameStatus {
    LOBBY = 'LOBBY',
    PLAYING = 'PLAYING',
    FINISHED = 'FINISHED',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    PLAYER = 'PLAYER',
}

export enum RoundStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
}

export enum TurnStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
}

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
}
