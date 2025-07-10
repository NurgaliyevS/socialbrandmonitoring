import Snoowrap from 'snoowrap';
import { HttpsProxyAgent } from 'https-proxy-agent';

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
 * Get a list of working proxy servers
 */
function getProxyList(): string[] {
  return [
    // Free proxy servers - you can add more working ones
    'http://103.149.162.194:80',
    'http://103.149.162.195:80',
    'http://103.149.162.196:80',
    'http://103.149.162.197:80',
    'http://103.149.162.198:80',
    // Add more proxies here as needed
  ];
}

/**
 * Fetch new comments from all subreddits using direct API call without auth
 * Uses the /r/all/comments.json endpoint for real-time comment data
 */
export async function fetchAllNewComments(limit: number = 100) {
  try {
    const url = `https://www.reddit.com/r/all/comments.json?limit=${limit}&raw_json=1`;
    console.log(`🔗 Making request to: ${url}`);
    
    // Get list of proxies
    const proxyList = getProxyList();
    
    // Try direct connection first, then proxies
    const connectionMethods = [
      { name: 'Direct', config: {} },
      ...proxyList.map((proxy, index) => ({
        name: `Proxy${index + 1} (${proxy})`,
        config: { 
          agent: new HttpsProxyAgent(proxy)
        }
      }))
    ];
    
    let lastError: Error | null = null;
    
    for (const method of connectionMethods) {
      try {
        console.log(`🔄 Trying connection method: ${method.name}`);
        
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        };
        
        console.log(`📤 Request headers:`, JSON.stringify(headers, null, 2));
        
        // Use fetch with proxy configuration
        const response = await fetch(url, { 
          headers,
          ...method.config
        });
        
        console.log(`📥 Response status: ${response.status} ${response.statusText}`);
        console.log(`📥 Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Response body:`, errorText);
          lastError = new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          continue; // Try next proxy
        }
        
        const data = await response.json();
        
        if (!data.data || !data.data.children) {
          console.error('❌ Invalid response structure:', JSON.stringify(data, null, 2));
          throw new Error('Invalid response format from Reddit API');
        }
        
        console.log(`📊 Found ${data.data.children.length} comments in response`);
        console.log(`✅ Successfully fetched comments using ${method.name}`);

        return data.data.children.map((commentData: any) => {
          const comment = commentData.data;
          console.log(`💬 Comment ID: ${comment.id}, Author: ${comment.author}, Body: ${comment.body?.substring(0, 50)}...`);
          return {
            id: comment.id,
            author: comment.author || 'deleted',
            subreddit: comment.subreddit,
            body: comment.body,
            url: comment.url,
            permalink: comment.permalink,
            score: comment.score,
            created: new Date(comment.created_utc * 1000),
            parentId: comment.parent_id,
            linkId: comment.link_id,
            isPost: false,
            // Additional fields available from the API
            gilded: comment.gilded,
            edited: comment.edited,
            stickied: comment.stickied,
            distinguished: comment.distinguished,
            controversiality: comment.controversiality,
            depth: comment.depth
          };
        });
        
      } catch (error) {
        console.error(`❌ Failed with ${method.name}:`, error);
        lastError = error as Error;
        continue; // Try next proxy
      }
    }
    
    // If we get here, all methods failed
    console.error('❌ All connection methods failed');
    throw lastError || new Error('All connection methods failed');
    
  } catch (error) {
    console.error('❌ Error fetching all new comments:', error);
    console.error('❌ Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
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