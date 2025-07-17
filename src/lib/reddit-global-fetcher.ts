import { fetchAllNewComments } from './reddit';

/**
 * Global comment fetcher that fetches comments once for all brands
 * Always gets the most recent comments without pagination
 */
export async function fetchGlobalComments(limit: number = 100): Promise<{
  comments: any[];
  after: string | null;
  before: string | null;
}> {
  try {
    console.log('🌐 Starting global comment fetch for all brands...');
    
    // Fetch comments once - always get most recent comments
    const result = await fetchAllNewComments(limit);
    console.log(`🌐 Fetched ${result.comments.length} comments globally`);
    
    console.log(`🌐 Global comment fetch completed`);
    
    return result;
  } catch (error) {
    console.error('❌ Error in global comment fetch:', error);
    throw error;
  }
} 