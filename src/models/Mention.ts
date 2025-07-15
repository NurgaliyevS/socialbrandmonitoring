import mongoose, { Schema, Document } from 'mongoose';

export interface IMention extends Document {
  brandId: mongoose.Types.ObjectId;
  keywordMatched: string;
  redditId: string;
  redditType: 'post' | 'comment';
  subreddit: string;
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
  redditId: { 
    type: String, 
    required: true,
    unique: true
  },
  redditType: { 
    type: String, 
    enum: ['post', 'comment'], 
    required: true 
  },
  subreddit: { 
    type: String, 
    required: true
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
  }
}, {
  timestamps: true
});

export default mongoose.models.Mention || mongoose.model<IMention>('Mention', MentionSchema); 