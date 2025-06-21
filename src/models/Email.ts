import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
  email: string;
  source: string;
  timestamp: Date;
  id: string;
}

const EmailSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: ['hero', 'pricing', 'modal', 'other'],
    default: 'modal'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a virtual for the id field
EmailSchema.virtual('id').get(function() {
  return (this._id as mongoose.Types.ObjectId).toHexString();
});

// Ensure virtual fields are serialized
EmailSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Prevent mongoose from creating the model multiple times
export default mongoose.models.Email || mongoose.model<IEmail>('Email', EmailSchema); 