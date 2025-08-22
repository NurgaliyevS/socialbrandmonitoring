import mongoose, { Schema, Document } from 'mongoose';

export interface IMention extends Document {
  brandId: mongoose.Types.ObjectId;
  keywordMatched: string;
  platform: 'reddit' | 'hackernews';
  itemId: string;
  itemType: 'post' | 'comment' | 'story';
  subreddit?: string; // Optional for HN
  author: string;
  title?: string;
  content: string;
  url: string;
  permalink: string;
  score: number;
  numComments: number;
  created: Date;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  isProcessed: boolean;
  unread: boolean;
  slackNotificationSent: boolean;
  slackNotificationSentAt?: Date;
  telegramNotificationSent: boolean;
  telegramNotificationSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MentionSchema = new Schema({
  brandId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true
  },
  keywordMatched: { 
    type: String, 
    required: true
  },
  platform: {
    type: String,
    enum: ['reddit', 'hackernews'],
    required: true
  },
  itemId: {
    type: String,
    required: true,
  },
  itemType: {
    type: String,
    enum: ['post', 'comment', 'story'],
    required: true
  },
  subreddit: { 
    type: String, 
    required: false // Optional for HN
  },
  author: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String 
  },
  content: { 
    type: String, 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  permalink: { 
    type: String, 
    required: true 
  },
  score: { 
    type: Number, 
    default: 0 
  },
  numComments: { 
    type: Number, 
    default: 0 
  },
  created: { 
    type: Date, 
    required: true 
  },
  sentiment: {
    score: { 
      type: Number, 
      required: true 
    },
    label: { 
      type: String, 
      enum: ['positive', 'negative', 'neutral'], 
      required: true 
    }
  },
  isProcessed: { 
    type: Boolean, 
    default: false 
  },
  unread: { 
    type: Boolean, 
    default: true 
  },
  slackNotificationSent: { 
    type: Boolean, 
    default: false 
  },
  slackNotificationSentAt: { 
    type: Date 
  },
  telegramNotificationSent: { 
    type: Boolean, 
    default: false 
  },
  telegramNotificationSentAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Add unique compound index to prevent duplicate mentions
// This ensures the same Reddit item (platform + itemId) can't be saved multiple times
MentionSchema.index({ platform: 1, itemId: 1 }, { unique: true });

export default mongoose.models.Mention || mongoose.model<IMention>('Mention', MentionSchema); 