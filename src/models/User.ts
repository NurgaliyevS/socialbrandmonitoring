import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface ISession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface IStripeSubscription {
  id: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  createdAt: Date;
  updatedAt: Date;
}

export interface IStripeOneTimePayment {
  id: string;
  stripePaymentIntentId: string;
  stripeCustomerId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'canceled';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: Date;
  accounts: IAccount[];
  sessions: ISession[];
  stripeCustomerId?: string;
  subscriptions: IStripeSubscription[];
  oneTimePayments: IStripeOneTimePayment[];
  onboardingComplete: boolean;
  plan: 'free' | 'paid' | 'lifetime'; // Added plan field
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  type: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  refresh_token: { type: String },
  access_token: { type: String },
  expires_at: { type: Number },
  token_type: { type: String },
  scope: { type: String },
  id_token: { type: String },
  session_state: { type: String }
}, { _id: false });

const SessionSchema = new Schema({
  id: { type: String, required: true },
  sessionToken: { type: String, required: true },
  userId: { type: String, required: true },
  expires: { type: Date, required: true }
}, { _id: false });

const StripeSubscriptionSchema = new Schema({
  id: { type: String, required: true },
  stripeSubscriptionId: { type: String, required: true },
  stripeCustomerId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'],
    required: true 
  },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  planId: { type: String, required: true },
  planName: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'usd' },
  interval: { type: String, enum: ['month', 'year'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const StripeOneTimePaymentSchema = new Schema({
  id: { type: String, required: true },
  stripePaymentIntentId: { type: String, required: true },
  stripeCustomerId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'usd' },
  status: { 
    type: String, 
    enum: ['succeeded', 'processing', 'requires_payment_method', 'requires_confirmation', 'requires_action', 'canceled'],
    required: true 
  },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  emailVerified: { type: Date },
  accounts: [AccountSchema],
  sessions: [SessionSchema],
  stripeCustomerId: { type: String },
  subscriptions: [StripeSubscriptionSchema],
  oneTimePayments: [StripeOneTimePaymentSchema],
  onboardingComplete: { type: Boolean, default: false },
  plan: { type: String, enum: ['free', 'paid', 'lifetime'], default: 'free' } // Added plan field
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 