// @ts-ignore
const Snoowrap = require('snoowrap');
// @ts-ignore
const { HttpsProxyAgent } = require('https-proxy-agent');
import axios from 'axios';
import { getRedditAccessToken } from './reddit-auth';

// Reddit API client configuration
let redditClient: any = null;

// Timeout constants for Reddit API calls
const REDDIT_API_TIMEOUT = 25000; // 25 seconds per API call
const REDDIT_SEARCH_TIMEOUT = 30000; // 30 seconds for search operations

/**
 * Initialize the Reddit API client with improved error handling
 */
export function initializeRedditClient(): any {
  if (!redditClient) {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;
    const userAgent = process.env.REDDIT_USER_AGENT || 'RedditSocialListening/1.0.0';

    if (!clientId || !clientSecret || !username || !password) {
      throw new Error('Missing Reddit API credentials. Please check your environment variables.');
    }

    // Configure Snoowrap with better network settings
    redditClient = new Snoowrap({
      userAgent,
      clientId,
      clientSecret,
      username,
      password,
      // Add request timeout and retry configuration
      requestDelay: 1000, // 1 second delay between requests
      retryErrorCodes: [502, 503, 504, 522], // Retry on server errors
      maxRetries: 3,
    });
  }

  return redditClient;
}

/**
 * Get the Reddit client instance
 */
export function getRedditClient(): any {
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
 * Retry function with exponential backoff and timeout
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  timeoutMs: number = REDDIT_API_TIMEOUT
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to each attempt
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`API call timed out after ${timeoutMs}ms`));
          }, timeoutMs);
        })
      ]);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('unauthorized') || 
            errorMessage.includes('forbidden') || 
            errorMessage.includes('invalid credentials') ||
            errorMessage.includes('timed out')) {
          throw error;
        }
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1} after ${Math.round(delay)}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Fetch new comments from all subreddits using direct API call without auth
 * Uses the /r/all/comments.json endpoint for real-time comment data
 */
export async function fetchAllNewComments(limit: number = 100, after?: string) {
  return retryWithBackoff(async () => {
    try {
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'RedditSocialListening/1.0.0 (via Evomi Proxy)'
      }

      // Configure axios with better network settings
      const axiosConfig: any = {
        headers: headers,
        timeout: REDDIT_API_TIMEOUT, // Use consistent timeout
        maxRedirects: 5,
      };

      // Get OAuth access token for authenticated request
      const accessToken = await getRedditAccessToken();
      
      // Add Authorization header for authenticated request
      axiosConfig.headers['Authorization'] = `Bearer ${accessToken}`;
      
      // Build URL with optional after parameter for pagination
      let url = `https://oauth.reddit.com/r/all/comments?limit=${limit}&raw_json=1`;
      if (after) {
        url += `&after=${after}`;
      }

      console.log("🔍 url", url);
      
      // Use axios to make an authenticated request to OAuth endpoint
      const response = await axios.get(url, axiosConfig);
      
      const data = response.data;
      
      if (!data.data || !data.data.children) {
        console.error('Response structure:', JSON.stringify(data, null, 2));
        throw new Error('Invalid response format from Reddit API');
      }

      const before = data?.data?.before;
      const responseAfter = data?.data?.after;

      console.log("⬅️ before", before);
      console.log("➡️ responseAfter", responseAfter);

      const comments = data.data.children.map((commentData: any) => {
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

      return {
        comments,
        after: responseAfter,
        before: data?.data?.before
      };
    } catch (error) {
      console.error('Error fetching all new comments:', error);
      throw error;
    }
  }, 3, 1000, REDDIT_API_TIMEOUT);
}
/**
 * Search for posts containing specific keywords with improved error handling
 */
export async function searchPosts(query: string, limit: number = 1000, subreddit?: string) {
  return retryWithBackoff(async () => {
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
  }, 3, 1000, REDDIT_SEARCH_TIMEOUT);
}
