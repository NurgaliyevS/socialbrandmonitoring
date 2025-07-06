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
export async function fetchNewPosts(subreddit: string = 'all', limit: number = 50) {
  try {
    const reddit = getRedditClient();
    const subredditInstance = await reddit.getSubreddit(subreddit);
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
    }));
  } catch (error) {
    console.error('Error fetching new posts:', error);
    throw error;
  }
}

/**
 * Keyword matching logic from PRD Step 1
 * Check if any keywords appear in post title, body, or comment text
 */
export function checkKeywordMatch(content: string, keywords: string[]): string | null {
  const lowerContent = content.toLowerCase();
  
  for (const keyword of keywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  
  return null;
}

/**
 * Search for posts containing specific keywords
 */
export async function searchPosts(query: string, subreddit?: string, limit: number = 25) {
  try {
    const reddit = getRedditClient();
    const searchOptions: any = { limit };
    
    if (subreddit) {
      const subredditInstance = await reddit.getSubreddit(subreddit);
      const posts = await subredditInstance.search(query, searchOptions);
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
    } else {
      const posts = await reddit.search(query, searchOptions);
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
    }
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
}