import mongoose, { Schema, Document } from 'mongoose';

export interface IKeyword {
  id: string;
  name: string;
  type: 'Own Brand' | 'Competitor' | 'Industry';
  mentions: 'low' | 'medium' | 'high';
  color: string;
}

export interface ICompany extends Document {
  name: string;
  website: string;
  title?: string;
  description?: string;
  keywords: IKeyword[];
  scrapedData?: {
    headings: string[];
    bodyText: string;
  };
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const KeywordSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Own Brand', 'Competitor', 'Industry'], required: true },
  mentions: { type: String, enum: ['low', 'medium', 'high'], required: true },
  color: { type: String, required: true }
});

const CompanySchema = new Schema({
  name: { type: String, required: true },
  website: { type: String, required: true, unique: true },
  title: { type: String },
  description: { type: String },
  keywords: [KeywordSchema],
  scrapedData: {
    headings: [String],
    bodyText: String
  },
  onboardingComplete: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema); 