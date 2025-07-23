import { monitorRedditContent } from './monitor';
import Mention from '@/models/Mention';
import connectDB from './mongodb';
import { analyzeSentiment } from './analyzeSentiment';


/**
 * Update sentiment for existing mentions
 * Implementation from PRD Step 3 - Sentiment Analysis
 */
export async function updateMentionSentiments() {
  try {
    await connectDB();
    
    // Find mentions without sentiment analysis
    const unprocessedMentions = await Mention.find({ 
      isProcessed: false 
    });
    
    console.log(`📊 Updating sentiment for ${unprocessedMentions.length} mentions`);
    
    // Step 2: Collect all sentiment results and update operations
    const updates = [];
    
    for (const mention of unprocessedMentions) {
      // No usage of redditId or redditType in this file, so no changes needed.
      const content = mention.title ? `${mention.title} ${mention.content}` : mention.content;
      const sentimentResult = analyzeSentiment(content);
      
      // Collect update operation instead of updating immediately
      updates.push({
        updateOne: {
          filter: { _id: mention._id },
          update: {
            sentiment: sentimentResult,
            isProcessed: true
          }
        }
      });
      
      console.log(`📝 Collected sentiment for mention ${mention._id}: ${sentimentResult.label} (${sentimentResult.score})`);
    }
    
    // Step 3: Implement Bulk Write - Replace individual updates with single bulkWrite() operation
    if (updates.length > 0) {
      const result = await Mention.bulkWrite(updates);
      console.log(`✅ Bulk updated ${result.modifiedCount} mentions with sentiment analysis`);
    } else {
      console.log('ℹ️ No mentions to update');
    }
    
    console.log('✅ Sentiment analysis completed');
    
  } catch (error) {
    console.error('❌ Error updating sentiment:', error);
    throw error;
  }
}

/**
 * Polling service that runs periodically
 * Implementation from PRD Step 3 - Polling Service
 */
export async function runPollingService() {
  try {
    console.log('🔄 Starting polling service...');
    
    // Step 1: Monitor Reddit content and find mentions
    const mentionsFound = await monitorRedditContent();
    console.log(`📝 Found ${mentionsFound || 0} new mentions`);
    
    // Step 2: Perform sentiment analysis on new mentions
    await updateMentionSentiments();
    
    console.log('✅ Polling service completed');
    
  } catch (error) {
    console.error('❌ Error in polling service:', error);
    throw error;
  }
}