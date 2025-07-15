import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationToken extends Document {
  identifier: string;
  token: string;
  expires: Date;
}

const VerificationTokenSchema = new Schema({
  identifier: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true }
});

export default mongoose.models.VerificationToken || mongoose.model<IVerificationToken>('VerificationToken', VerificationTokenSchema); 