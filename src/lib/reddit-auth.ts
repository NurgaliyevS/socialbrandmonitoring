import axios from 'axios';

// Timeout constant for Reddit API calls
const REDDIT_API_TIMEOUT = 25000; // 25 seconds per API call

/**
 * Get Reddit OAuth access token using client credentials flow
 */
export async function getRedditAccessToken(): Promise<string> {
  try {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Reddit API credentials. Please check your environment variables.');
    }

    const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'RedditSocialListening/1.0.0'
        },
        auth: {
          username: clientId,
          password: clientSecret
        },
        timeout: REDDIT_API_TIMEOUT
      }
    );

    if (!tokenResponse.data.access_token) {
      throw new Error('No access token received from Reddit');
    }

    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Error getting Reddit access token:', error);
    throw error;
  }
} 