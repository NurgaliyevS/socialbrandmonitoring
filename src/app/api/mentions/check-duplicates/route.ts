import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { checkForDuplicateMentions } from '@/lib/utils';

export const GET = withAuth(async (request) => {
  try {
    const result = await checkForDuplicateMentions();
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check for duplicates' 
      },
      { status: 500 }
    );
  }
});
