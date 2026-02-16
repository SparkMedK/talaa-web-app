import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
    adminId: mongoose.Types.ObjectId;
    code: string;
    status: 'LOBBY' | 'PLAYING' | 'FINISHED';
    language: 'EN';
    maxPlayers: number;
    winningScore: number;
    currentRound: number;
    createdAt: Date;
    updatedAt: Date;
}

const GameSchema: Schema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, unique: true, required: true },
    status: { type: String, enum: ['LOBBY', 'PLAYING', 'FINISHED'], default: 'LOBBY' },
    language: { type: String, enum: ['EN'], default: 'EN' },
    maxPlayers: { type: Number, default: 10 },
    winningScore: { type: Number, default: 20 },
    currentRound: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IGame>('Game', GameSchema);
