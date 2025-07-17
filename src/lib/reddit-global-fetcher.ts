import { fetchAllNewComments } from './reddit';
import Company from '@/models/Company';

/**
 * Get the most recent after token from any brand
 * Used as the global token for fetching comments
 */
async function getGlobalAfterToken(): Promise<string | null> {
  try {
    // Find the brand with the most recent after token
    const company = await Company.findOne({
      redditAfterToken: { $exists: true, $ne: null }
    }).sort({ updatedAt: -1 });
    
    return company?.redditAfterToken || null;
  } catch (error) {
    console.error('Error getting global after token:', error);
    return null;
  }
}

/**
 * Update all brands' after tokens to the same value
 * This keeps all brands synchronized
 */
async function updateAllBrandsAfterToken(afterToken: string): Promise<void> {
  try {
    await Company.updateMany(
      { keywords: { $exists: true, $ne: [] } },
      { redditAfterToken: afterToken }
    );
    console.log(`✅ Updated after token for all brands: ${afterToken}`);
  } catch (error) {
    console.error('Error updating all brands after token:', error);
    throw error;
  }
}

/**
 * Global comment fetcher that fetches comments once for all brands
 * Uses a single after token and returns the same comment batch for all brands
 */
export async function fetchGlobalComments(limit: number = 100): Promise<{
  comments: any[];
  after: string | null;
  before: string | null;
}> {
  try {
    console.log('🌐 Starting global comment fetch for all brands...');
    
    // Step 1: Get the most recent after token from any brand
    const globalAfterToken = await getGlobalAfterToken();
    console.log(`🌐 Using global after token: ${globalAfterToken || 'none (fresh start)'}`);
    
    // Step 2: Fetch comments once using the global token
    const result = await fetchAllNewComments(limit, globalAfterToken || undefined);
    console.log(`🌐 Fetched ${result.comments.length} comments globally`);
    
    // Step 3: Update all brands' after tokens to the new value
    if (result.after) {
      await updateAllBrandsAfterToken(result.after);
    }
    
    console.log(`🌐 Global comment fetch completed. New after token: ${result.after}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error in global comment fetch:', error);
    throw error;
  }
} 