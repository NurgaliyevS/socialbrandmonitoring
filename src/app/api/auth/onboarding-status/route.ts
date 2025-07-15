import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const user = await User.findById(request.user!.id).select('onboardingComplete');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      onboardingComplete: user.onboardingComplete || false
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}); 