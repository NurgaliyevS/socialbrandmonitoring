import connectDB from '@/lib/mongodb';
import Mention from '@/models/Mention';
import Company from '@/models/Company';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

// Helper function to get all keywords from user's companies
async function getUserKeywords(userId: string): Promise<string[]> {
  await connectDB();
  
  const companies = await Company.find({ user: userId });
  
  // Extract all keywords from all companies
  const allKeywords = companies.flatMap((company: any) => 
    company.keywords.map((keyword: any) => keyword.name.toLowerCase())
  );
  
  return allKeywords;
}

// GET - Fetch unique filter options (subreddits and keywords) for the user's mentions
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    // Get user's keywords to filter mentions
    const userKeywords = await getUserKeywords(request.user!.id);
    
    if (userKeywords.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          subreddits: [],
          keywords: []
        }
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    // Build filter object - filter by keywords instead of brandId
    const filter: any = {
      keywordMatched: { $in: userKeywords }
    };
    if (platform && ['reddit', 'hackernews'].includes(platform)) {
      filter.platform = platform;
    }
    // Get unique subreddits
    const subreddits = await Mention.distinct('subreddit', filter);
    // Get unique keywords that match user's keywords
    const keywords = await Mention.distinct('keywordMatched', filter);
    // Get unique platforms present for this user's brands
    const platforms = await Mention.distinct('platform', filter);
    return NextResponse.json({
      success: true,
      data: {
        subreddits: subreddits.sort(),
        keywords: keywords.sort(),
        platforms: platforms.sort()
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