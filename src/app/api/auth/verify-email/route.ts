import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
import Company from '@/models/Company';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Verification token is required.' 
      }, { status: 400 });
    }

    await connectDB();

    // Find and validate the verification token
    const verificationToken = await VerificationToken.findOne({
      token,
      expires: { $gt: new Date() } // Token hasn't expired
    });

    if (!verificationToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired verification token.' 
      }, { status: 400 });
    }

    // Find the user by email
    const user = await User.findOne({ email: verificationToken.identifier });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found.' 
      }, { status: 404 });
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email is already verified.' 
      }, { status: 200 });
    }

    // Update user's emailVerified field to current timestamp
    await User.findByIdAndUpdate(user._id, {
      emailVerified: new Date()
    });

    // Update all companies to have email 
    await Company.updateMany({ user: user._id }, { 
      $set: { 
        emailConfig: {
          recipients: [user.email],
          enabled: false  // Keep disabled by default
        }
      } 
    });

    // Delete the used verification token
    await VerificationToken.findByIdAndDelete(verificationToken._id);

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully!',
      email: user.email
    }, { status: 200 });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error.' 
    }, { status: 500 });
  }
} 