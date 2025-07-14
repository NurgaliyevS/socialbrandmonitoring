import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
}

export async function authenticateUser(request: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  try {
    // Get the session from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();
    
    // Verify user exists in database
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Add user to request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image
    };

    return authenticatedRequest;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Higher-order function to wrap API handlers with authentication
export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateUser(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }
    
    return handler(authResult);
  };
} 