import Sentiment from 'sentiment';
import { monitorRedditContent } from './monitor';
import Mention from '@/models/Mention';
import connectDB from './mongodb';

// Initialize sentiment analyzer
const sentiment = new Sentiment();

/**
 * Perform sentiment analysis on text
 * Implementation from PRD Step 3 - Sentiment Analysis
 */
export function analyzeSentiment(text: string): { score: number; label: 'positive' | 'negative' | 'neutral' } {
  const result = sentiment.analyze(text);
  
  // Determine sentiment label based on score
  let label: 'positive' | 'negative' | 'neutral';
  if (result.score > 0) {
    label = 'positive';
  } else if (result.score < 0) {
    label = 'negative';
  } else {
    label = 'neutral';
  }
  
  return {
    score: result.score,
    label
  };
}

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
    }).limit(50);
    
    console.log(`📊 Updating sentiment for ${unprocessedMentions.length} mentions`);
    
    for (const mention of unprocessedMentions) {
      const content = mention.title ? `${mention.title} ${mention.content}` : mention.content;
      const sentimentResult = analyzeSentiment(content);
      
      // Update mention with sentiment analysis
      await Mention.findByIdAndUpdate(mention._id, {
        sentiment: sentimentResult,
        isProcessed: true
      });
      
      console.log(`✅ Updated sentiment for mention ${mention._id}: ${sentimentResult.label} (${sentimentResult.score})`);
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

/**
 * Start continuous polling (for development/testing)
 * In production, this would be scheduled via Vercel Cron Jobs
 */
export async function startContinuousPolling(intervalMinutes: number = 5) {
  console.log(`🚀 Starting continuous polling every ${intervalMinutes} minutes`);
  
  // Run immediately
  await runPollingService();
  
  // Then run on interval
  setInterval(async () => {
    try {
      await runPollingService();
    } catch (error) {
      console.error('❌ Error in continuous polling:', error);
    }
  }, intervalMinutes * 60 * 1000);
} 