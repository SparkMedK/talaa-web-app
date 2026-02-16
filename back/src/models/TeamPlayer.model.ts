import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamPlayer extends Document {
    teamId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
}

const TeamPlayerSchema: Schema = new Schema({
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

TeamPlayerSchema.index({ teamId: 1, userId: 1 });

export default mongoose.model<ITeamPlayer>('TeamPlayer', TeamPlayerSchema);
