import mongoose, { Schema, Document } from 'mongoose';

export interface ITurn extends Document {
    roundId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    describerId: mongoose.Types.ObjectId;
    words: string[];
    solvedWords: string[];
    startTime: Date;
    duration: number;
    status: 'ACTIVE' | 'COMPLETED';
}

const TurnSchema: Schema = new Schema({
    roundId: { type: Schema.Types.ObjectId, ref: 'Round', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    describerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    words: { type: [String], default: [] },
    solvedWords: { type: [String], default: [] },
    startTime: { type: Date, default: Date.now },
    duration: { type: Number, default: 30 },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' }
});

TurnSchema.index({ roundId: 1 });

export default mongoose.model<ITurn>('Turn', TurnSchema);
