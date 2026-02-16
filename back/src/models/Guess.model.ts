import mongoose, { Schema, Document } from 'mongoose';

export interface IGuess extends Document {
    turnId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    input: string;
    points: number;
    createdAt: Date;
}

const GuessSchema: Schema = new Schema({
    turnId: { type: Schema.Types.ObjectId, ref: 'Turn', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    input: { type: String, required: true },
    points: { type: Number, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

GuessSchema.index({ turnId: 1 });

export default mongoose.model<IGuess>('Guess', GuessSchema);
