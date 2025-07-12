import Snoowrap from 'snoowrap';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios';

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
 * Fetch new comments from all subreddits using direct API call without auth
 * Uses the /r/all/comments.json endpoint for real-time comment data
 */
export async function fetchAllNewComments(limit: number = 100) {
  try {
    const proxy: string = process.env.HTTP_PROXY || '';
    const agent = new HttpsProxyAgent(proxy);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'RedditSocialListening/1.0.0 (via Evomi Proxy)'
    }

    // Use axios to make a direct request without authentication (fetch doesn't support proxy agent)
    const response = await axios.get(`https://www.reddit.com/r/all/comments.json?limit=${limit}&raw_json=1`, {
      headers: headers,
      httpsAgent: agent,
    });
    
    const data = response.data;
    
    if (!data.data || !data.data.children) {
      console.error('Response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response format from Reddit API');
    }
    
    console.log(data.data.children.length, 'data.data.children.length')

    return data.data.children.map((commentData: any) => {
      const comment = commentData.data;
      return {
        id: comment.id,
        title: comment.link_title, // parent post title 
        author: comment.author || 'deleted',
        subreddit: comment.subreddit,
        url: `https://www.reddit.com${comment.permalink}`,
        permalink: comment.permalink,
        score: comment.score,
        numComments: comment.num_comments,
        created: new Date(comment.created_utc * 1000),
        body: comment.body,
        linkTitle: comment.link_title, // parent post title
        linkUrl: comment.link_url, // parent post url
      };
    });
  } catch (error) {
    console.error('Error fetching all new comments:', error);
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