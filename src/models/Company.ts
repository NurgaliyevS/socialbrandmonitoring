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
  // Notification settings from PRD Step 4.2
  slackConfig?: {
    webhookUrl?: string;
    enabled: boolean;
  };
  emailConfig?: {
    recipients: string[];
    enabled: boolean;
  };
  telegramConfig?: {
    enabled: boolean;
    chatId?: string;
  };
  onboardingComplete: boolean;
  // Reddit pagination state for continuous monitoring
  redditAfterToken?: string;
  // First email tracking for users with 5+ mentions
  firstEmailSent?: boolean;
  firstEmailSentAt?: Date;
  firstEmailMentionCount?: number;
  user: mongoose.Types.ObjectId; // Required user reference
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
  website: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  keywords: [KeywordSchema],
  scrapedData: {
    headings: [String],
    bodyText: String
  },
  // Notification settings from PRD Step 4.2
  slackConfig: {
    webhookUrl: { type: String },
    enabled: { type: Boolean, default: false }
  },
  emailConfig: {
    recipients: [{ type: String }],
    enabled: { type: Boolean, default: true }
  },
  telegramConfig: {
    enabled: { type: Boolean, default: false },
    chatId: { type: String },
  },
  onboardingComplete: { type: Boolean, default: false },
  // Reddit pagination state for continuous monitoring
  redditAfterToken: { type: String },
  // First email tracking for users with 5+ mentions
  firstEmailSent: { type: Boolean, default: false },
  firstEmailSentAt: { type: Date },
  firstEmailMentionCount: { type: Number },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // <-- Required user reference
}, {
  timestamps: true
});

export default (mongoose.models && mongoose.models.Company) || mongoose.model<ICompany>('Company', CompanySchema); 