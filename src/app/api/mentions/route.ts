import connectDB from '@/lib/mongodb';
import Mention from '@/models/Mention';
import Company from '@/models/Company';

// GET - Fetch mentions with filtering and pagination
export async function GET(request: Request) {
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

    // Build filter object
    const filter: any = {};
    
    if (brandId) {
      filter.brandId = brandId;
    }
    
    if (sentiment && ['positive', 'negative', 'neutral'].includes(sentiment)) {
      filter['sentiment.label'] = sentiment;
    }
    
    if (subreddit) {
      filter.subreddit = { $regex: subreddit, $options: 'i' };
    }
    
    if (keyword) {
      filter.keywordMatched = { $regex: keyword, $options: 'i' };
    }

    // Fetch mentions with pagination
    const mentions = await Mention.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('brandId', 'name website');

    // Get total count for pagination
    const total = await Mention.countDocuments(filter);

    // Transform mentions to match frontend interface
    const transformedMentions = mentions.map(mention => ({
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
      redditType: mention.redditType,
      unread: mention.unread
    }));

    return Response.json({
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
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH - Mark mentions as read or unread
export async function PATCH(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { mentionIds, action = 'markAsRead' } = body;

    if (!mentionIds || !Array.isArray(mentionIds) || mentionIds.length === 0) {
      return Response.json({
        success: false,
        error: 'mentionIds array is required'
      }, { status: 400 });
    }

    // Determine the unread value based on action
    const unreadValue = action === 'markAsUnread' ? true : false;

    // Update mentions to mark them as read or unread
    const result = await Mention.updateMany(
      { _id: { $in: mentionIds } },
      { $set: { unread: unreadValue } }
    );

    return Response.json({
      success: true,
      data: {
        updatedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking mentions as read/unread:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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