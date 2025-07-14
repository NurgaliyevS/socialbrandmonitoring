import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
import { sendPasswordResetEmail } from '@/lib/email-notifications';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      // For security, do not reveal if the email is not registered
      return NextResponse.json({ message: 'If that email is registered, a reset link will be sent.' }, { status: 200 });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Store the token
    await VerificationToken.create({
      identifier: email,
      token,
      expires,
    });

    // Send the reset email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: 'If that email is registered, a reset link will be sent.' }, { status: 200 });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 