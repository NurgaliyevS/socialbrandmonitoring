import Snoowrap from 'snoowrap';

// Reddit API client configuration
let redditClient: Snoowrap | null = null;

/**
 * Initialize the Reddit API client
 */
export function initializeRedditClient(): Snoowrap {
  if (!redditClient) {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;
    const userAgent = process.env.REDDIT_USER_AGENT || 'RedditSocialListening/1.0.0';

    if (!clientId || !clientSecret || !username || !password) {
      throw new Error('Missing Reddit API credentials. Please check your environment variables.');
    }

    redditClient = new Snoowrap({
      userAgent,
      clientId,
      clientSecret,
      username,
      password,
    });
  }

  return redditClient;
}

/**
 * Get the Reddit client instance
 */
export function getRedditClient(): Snoowrap {
  if (!redditClient) {
    return initializeRedditClient();
  }
  return redditClient;
}

/**
 * Fetch new posts from a subreddit
 * Implementation from PRD Step 1
 */
export async function fetchNewPosts(subreddit: string = 'all', limit: number = 100) {
  try {
    const reddit = getRedditClient();
    const subredditInstance = reddit.getSubreddit(subreddit);
    const newPosts = await subredditInstance.getNew({ limit });
    
    return newPosts.map((post: any) => ({
      id: post.id,
      title: post.title,
      author: post.author?.name || 'deleted',
      subreddit: post.subreddit.display_name,
      url: post.url,
      permalink: post.permalink,
      score: post.score,
      numComments: post.num_comments,
      created: new Date(post.created_utc * 1000),
      selftext: post.selftext || '',
      isSelf: post.is_self,
      isPost: true
    }));
  } catch (error) {
    console.error('Error fetching new posts:', error);
    throw error;
  }
}

/**
 * Keyword matching logic from PRD Step 1
 * Check if any keywords appear in post title, body, or comment text
 * Uses word boundaries to avoid false matches
 */
export function checkKeywordMatch(content: string, keywords: string[]): string | null {
  const lowerContent = content.toLowerCase();
  
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    
    // Use word boundaries to avoid false matches (e.g., "AI" in "again")
    const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    
    if (regex.test(lowerContent)) {
      return keyword;
    }
  }
  
  return null;
}

/**
 * Fetch new comments from a subreddit
 * Implementation from PRD Step 2 - Posts vs Comments
 */
export async function fetchNewComments(subreddit: string = 'all', limit: number = 100) {
  try {
    const reddit = getRedditClient();
    const subredditInstance = reddit.getSubreddit(subreddit);
    const newComments = await subredditInstance.getNewComments({ limit });
    
    return newComments.map((comment: any) => ({
      id: comment.id,
      author: comment.author?.name || 'deleted',
      subreddit: comment.subreddit.display_name,
      body: comment.body,
      url: comment.url,
      permalink: comment.permalink,
      score: comment.score,
      created: new Date(comment.created_utc * 1000),
      parentId: comment.parent_id,
      linkId: comment.link_id,
      isPost: false
    }));
  } catch (error) {
    console.error('Error fetching new comments:', error);
    throw error;
  }
}

/**
 * Fetch comments for a specific post
 * Implementation from PRD Step 2 - Posts vs Comments
 */
export async function fetchPostComments(postId: string, limit: number = 100) {
  try {
    const reddit = getRedditClient();
    const submission = reddit.getSubmission(postId);
    const comments = await submission.comments.fetchAll();
    
    return comments.map((comment: any) => ({
      id: comment.id,
      author: comment.author?.name || 'deleted',
      subreddit: comment.subreddit.display_name,
      body: comment.body,
      url: comment.url,
      permalink: comment.permalink,
      score: comment.score,
      created: new Date(comment.created_utc * 1000),
      parentId: comment.parent_id,
      linkId: comment.link_id,
      isPost: false
    }));
  } catch (error) {
    console.error('Error fetching post comments:', error);
    throw error;
  }
}

/**
 * Search for posts containing specific keywords
 */
export async function searchPosts(query: string, limit: number = 1000, subreddit?: string) {
  try {
    const reddit = getRedditClient();
    
    console.log(`Searching for: "${query}"`);
    
    const posts = await reddit.search({
      query: `"${query}"`,  // Exact phrase matching
      sort: 'new',
      limit,
      syntax: 'lucene',  // Use Lucene for better control
      time: 'month',
      restrictSr: false
    });
    
    console.log(`Found ${posts.length} posts for "${query}"`);
    
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      author: post.author?.name || 'deleted',
      subreddit: post.subreddit.display_name,
      url: post.url,
      permalink: post.permalink,
      score: post.score,
      numComments: post.num_comments,
      created: new Date(post.created_utc * 1000),
      selftext: post.selftext || '',
      isSelf: post.is_self,
    }));
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
}