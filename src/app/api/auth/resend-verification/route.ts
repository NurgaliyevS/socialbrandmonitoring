import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
import { sendVerificationEmail } from '@/lib/email-notifications';

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email address is required.' 
      }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email address.' 
      }, { status: 400 });
    }

    // Rate limiting: Check if user has requested recently
    const rateLimitKey = `resend_verification:${email}`;
    const now = Date.now();
    const lastRequest = rateLimitMap.get(rateLimitKey) || 0;
    const timeWindow = 5 * 60 * 1000; // 5 minutes

    if (now - lastRequest < timeWindow) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please wait 5 minutes before requesting another verification email.' 
      }, { status: 429 });
    }

    await connectDB();

    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, a verification link will be sent.' 
      }, { status: 200 });
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        success: false, 
        error: 'This email is already verified.' 
      }, { status: 400 });
    }

    // Delete any existing verification tokens for this email
    await VerificationToken.deleteMany({ identifier: email });

    // Generate new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Store new verification token
    await VerificationToken.create({
      identifier: email,
      token,
      expires,
    });

    // Send new verification email
    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send verification email. Please try again later.' 
      }, { status: 500 });
    }

    // Update rate limit
    rateLimitMap.set(rateLimitKey, now);

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent successfully!' 
    }, { status: 200 });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error.' 
    }, { status: 500 });
  }
} 