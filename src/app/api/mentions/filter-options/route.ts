import connectDB from '@/lib/mongodb';
import Mention from '@/models/Mention';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { getUserCompanyIds } from '@/lib/user-helpers';
import { NextResponse } from 'next/server';

// GET - Fetch unique filter options (subreddits and keywords) for the user's mentions
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    // Get user's company IDs to filter mentions
    const userCompanyIds = await getUserCompanyIds(request.user!.id);
    
    if (userCompanyIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          subreddits: [],
          keywords: []
        }
      });
    }

    // Build filter object - ALWAYS filter by user's companies
    const filter: any = {
      brandId: { $in: userCompanyIds }
    };

    // Get unique subreddits
    const subreddits = await Mention.distinct('subreddit', filter);
    
    // Get unique keywords
    const keywords = await Mention.distinct('keywordMatched', filter);

    return NextResponse.json({
      success: true,
      data: {
        subreddits: subreddits.sort(),
        keywords: keywords.sort()
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}); 