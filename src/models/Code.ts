import mongoose, { Schema, Document } from 'mongoose';

interface ICode extends Document {
  code: string;
  redeemed: boolean;
  redeemedAt?: Date;
  buyerEmail?: string;
}

const CodeSchema = new Schema<ICode>({
  code: { type: String, required: true, unique: true },
  redeemed: { type: Boolean, default: false },
  redeemedAt: { type: Date },
  buyerEmail: { type: String, default: null }
}, { collection: 'codes' });

export default (mongoose.models && mongoose.models.Code) || mongoose.model<ICode>('Code', CodeSchema); 