import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
    gameId: mongoose.Types.ObjectId;
    name: string;
    score: number;
    order: number;
}

const TeamSchema: Schema = new Schema({
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    order: { type: Number, required: true }
});

TeamSchema.index({ gameId: 1 });

export default mongoose.model<ITeam>('Team', TeamSchema);
