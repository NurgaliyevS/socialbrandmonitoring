import connectDB from '@/lib/mongodb';
import Mention from '@/models/Mention';
import Company from '@/models/Company';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

// Helper function to get all keywords from user's companies
async function getUserKeywords(userId: string, specificBrandId?: string): Promise<string[]> {
  await connectDB();
  
  let filter: any = { user: userId };
  
  // If specific brand is requested, filter to only that brand
  if (specificBrandId) {
    filter._id = specificBrandId;
  }
  
  const companies = await Company.find(filter);
  
  // Extract all keywords from all companies
  const allKeywords = companies.flatMap((company: any) => 
    company.keywords.map((keyword: any) => keyword.name.toLowerCase())
  );
  
  return allKeywords;
}

// GET - Fetch mentions with filtering and pagination
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const brandId = searchParams.get('brandId');
    const sentiment = searchParams.get('sentiment');
    const subreddit = searchParams.get('subreddit');
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const platform = searchParams.get('platform');
    const unread = searchParams.get('unread');
    // Get user's keywords instead of company IDs
    const userKeywords = await getUserKeywords(request.user!.id, brandId || undefined);
    
    if (userKeywords.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          mentions: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Build filter object - filter by keywords instead of brandId
    const filter: any = {
      keywordMatched: { $in: userKeywords }
    };
    
    // Additional filters
    if (sentiment && ['positive', 'negative', 'neutral'].includes(sentiment)) {
      filter['sentiment.label'] = sentiment;
    }
    
    if (platform && ['reddit', 'hackernews'].includes(platform)) {
      filter.platform = platform;
    }
    
    if (subreddit) {
      filter.subreddit = { $regex: subreddit, $options: 'i' };
    }
    
    if (keyword) {
      filter.keywordMatched = { $regex: keyword, $options: 'i' };
    }

    if (unread) {
      filter.unread = unread === 'true';
    }

    // Fetch mentions with pagination
    const mentions = await Mention.find(filter)
      .sort({ created: -1 }) // Sort by Reddit creation date (newest first)
      .skip(skip)
      .limit(limit)
      .populate('brandId', 'name website');

    // Get total count for pagination
    const total = await Mention.countDocuments(filter);

    // Transform mentions to match frontend interface
    const transformedMentions = mentions.map((mention: any) => ({
      id: mention._id.toString(),
      subreddit: mention.subreddit,
      author: mention.author,
      title: mention.title || '',
      content: mention.content,
      url: mention.url,
      score: mention.score,
      comments: mention.numComments,
      timestamp: formatTimestamp(mention.created),
      sentiment: mention.sentiment.label,
      keywords: [mention.keywordMatched],
      brandName: (mention.brandId as any)?.name || 'Unknown Brand',
      permalink: mention.permalink,
      itemType: mention.itemType, // Use itemType instead of redditType
      platform: mention.platform, // Always include platform
      unread: mention.unread
    }));

    return NextResponse.json({
      success: true,
      data: {
        mentions: transformedMentions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching mentions:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

// PATCH - Mark mentions as read or unread
export const PATCH = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await request.json();
    const { mentionIds, action = 'markAsRead' } = body;

    if (!mentionIds || !Array.isArray(mentionIds) || mentionIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'mentionIds array is required'
      }, { status: 400 });
    }

    // Get user's keywords to ensure they can only update mentions for their keywords
    const userKeywords = await getUserKeywords(request.user!.id);

    // Determine the unread value based on action
    const unreadValue = action === 'markAsUnread' ? true : false;

    // Update mentions to mark them as read or unread - ONLY for user's keywords
    const result = await Mention.updateMany(
      { 
        _id: { $in: mentionIds },
        keywordMatched: { $in: userKeywords } // Only update mentions for user's keywords
      },
      { $set: { unread: unreadValue } }
    );

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking mentions as read/unread:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

// Helper function to format timestamp
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
} 