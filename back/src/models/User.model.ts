import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    nickname: string;
    role: 'ADMIN' | 'PLAYER';
    gameId: mongoose.Types.ObjectId;
    isConnected: boolean;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    nickname: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'PLAYER'], default: 'PLAYER' },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    isConnected: { type: Boolean, default: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

UserSchema.index({ gameId: 1 });

export default mongoose.model<IUser>('User', UserSchema);
