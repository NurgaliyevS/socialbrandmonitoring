import Company from '@/models/Company';

/**
 * Get the stored Reddit after token for a company
 */
export async function getRedditAfterToken(companyId: string): Promise<string | null> {
  try {
    const company = await Company.findById(companyId);
    return company?.redditAfterToken || null;
  } catch (error) {
    console.error('Error getting Reddit after token:', error);
    return null;
  }
}

/**
 * Store the Reddit after token for a company
 */
export async function setRedditAfterToken(companyId: string, afterToken: string): Promise<void> {
  try {
    await Company.findByIdAndUpdate(companyId, {
      redditAfterToken: afterToken
    });
  } catch (error) {
    console.error('Error setting Reddit after token:', error);
    throw error;
  }
}

/**
 * Fetch new comments with pagination state management
 * Handles the complete usage flow for continuous monitoring
 */
export async function fetchNewCommentsWithPagination(
  companyId: string, 
  limit: number = 100
): Promise<{ comments: any[], after: string | null, before: string | null }> {
  let storedAfter: string | null = null;
  
  try {
    // Step 1: Get stored after token
    storedAfter = await getRedditAfterToken(companyId);
    
    // Step 2: Import the fetch function
    const { fetchAllNewComments } = await import('./reddit');
    
    // Step 3: Make API call with stored after token
    const result = await fetchAllNewComments(limit, storedAfter || undefined);
    
    // Step 4: Store the new after token for next call (only on success)
    if (result.after) {
      await setRedditAfterToken(companyId, result.after);
    }
    
    return result;
  } catch (error) {
    console.error('Error in fetchNewCommentsWithPagination:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // Handle invalid after token (comments deleted or token expired)
      if (errorMessage.includes('invalid') || errorMessage.includes('not found') || errorMessage.includes('404')) {
        console.log('Invalid after token detected, clearing stored token and retrying...');
        
        try {
          // Clear the invalid token
          await setRedditAfterToken(companyId, '');
          
          // Retry without after token (fresh start)
          const { fetchAllNewComments } = await import('./reddit');
          const result = await fetchAllNewComments(limit, undefined);
          
          // Store the new after token
          if (result.after) {
            await setRedditAfterToken(companyId, result.after);
          }
          
          return result;
        } catch (retryError) {
          console.error('Error during retry after clearing invalid token:', retryError);
          throw retryError;
        }
      }
      
      // Handle rate limiting or temporary errors
      if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('timeout')) {
        console.log('Rate limit or timeout detected, will retry with same after token on next call');
        // Don't update stored after token, will retry with same token
        throw error;
      }
    }
    
    // For any other error, don't update stored after token
    // This ensures we don't lose our place in the comment stream
    console.log('API call failed, keeping existing after token for retry');
    throw error;
  }
} 