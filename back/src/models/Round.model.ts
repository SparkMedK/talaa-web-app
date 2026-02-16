import mongoose, { Schema, Document } from 'mongoose';

export interface IRound extends Document {
    gameId: mongoose.Types.ObjectId;
    roundNumber: number;
    status: 'ACTIVE' | 'COMPLETED';
}

const RoundSchema: Schema = new Schema({
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    roundNumber: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' }
});

RoundSchema.index({ gameId: 1 });

export default mongoose.model<IRound>('Round', RoundSchema);
