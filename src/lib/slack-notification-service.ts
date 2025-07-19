import connectDB from './mongodb';
import Mention from '@/models/Mention';
import Company from '@/models/Company';
import { sendSlackNotification } from './slack-notifications';

/**
 * Get mentions that need Slack notifications
 * Finds mentions that haven't been sent to Slack yet
 */
export async function getPendingNotifications() {
  await connectDB();
  
  // Find mentions that haven't been sent to Slack yet
  const pendingMentions = await Mention.find({
    slackNotificationSent: { $ne: true }
  }).populate('brandId');
  
  console.log(`📋 Found ${pendingMentions.length} pending Slack notifications`);
  
  // Filter to only include mentions for brands with Slack enabled
  const filteredMentions = pendingMentions.filter((mention: any) => {
    const brand = mention.brandId;
    return brand && brand.slackConfig?.enabled && brand.slackConfig?.webhookUrl;
  });
  
  console.log(`📋 ${filteredMentions.length} mentions have Slack notifications enabled`);
  
  return filteredMentions;
}

/**
 * Mark a mention as having been sent to Slack
 * Updates the mention record to prevent duplicate notifications
 */
export async function markNotificationSent(mentionId: string) {
  await connectDB();
  
  try {
    await Mention.findByIdAndUpdate(mentionId, {
      slackNotificationSent: true,
      slackNotificationSentAt: new Date()
    });
    
    console.log(`✅ Marked mention ${mentionId} as Slack notification sent`);
  } catch (error) {
    console.error(`❌ Failed to mark mention ${mentionId} as sent:`, error);
    throw error;
  }
}

/**
 * Process all pending Slack notifications
 * Main function that handles the entire notification workflow
 */
export async function processPendingSlackNotifications() {
  console.log('🚀 Starting Slack notification processing...');
  
  try {
    // Get pending notifications
    const pendingMentions = await getPendingNotifications();
    
    if (pendingMentions.length === 0) {
      console.log('ℹ️ No pending Slack notifications to process');
      return {
        total: 0,
        success: 0,
        failed: 0
      };
    }
    
    console.log(`📤 Processing ${pendingMentions.length} Slack notifications...`);
    
    let successCount = 0;
    let failureCount = 0;
    
    // Process in batches to avoid timeouts - SIMPLE SOLUTION
    const batchSize = 5; // Reduced from 10 to 5 for faster processing
    const maxNotifications = 50; // Limit to 50 notifications per run to stay under 5-minute limit
    
    // Limit the number of notifications to process
    const limitedMentions = pendingMentions.slice(0, maxNotifications);
    const totalBatches = Math.ceil(limitedMentions.length / batchSize);
    
    console.log(`📦 Processing ${limitedMentions.length} notifications in ${totalBatches} batches of ${batchSize} each (limited to ${maxNotifications} per run)`);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, limitedMentions.length);
      const batch = limitedMentions.slice(startIndex, endIndex);
      
      console.log(`📦 Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} notifications)`);
      
      // Process each mention in the current batch
      for (const mention of batch) {
        try {
          console.log(`📤 Sending notification for mention ${mention.redditId}...`);
          
                  // Send Slack notification
        await sendSlackNotification(mention.brandId._id.toString(), {
            keywordMatched: mention.keywordMatched,
            title: mention.title,
            content: mention.content,
            subreddit: mention.subreddit,
            author: mention.author,
            url: mention.url,
            sentiment: mention.sentiment
          });
          
          // Mark as sent immediately after successful notification
          await markNotificationSent(mention._id.toString());
          
          successCount++;
          console.log(`✅ Successfully sent notification for mention ${mention.redditId}`);
          
        } catch (error) {
          failureCount++;
          console.error(`❌ Failed to send notification for mention ${mention.redditId}:`, error);
          
          // CRITICAL: Mark as sent even if notification fails to prevent infinite retries
          // This prevents the system from getting stuck on failed notifications
          try {
            await markNotificationSent(mention._id.toString());
            console.log(`⚠️ Marked failed notification as sent to prevent infinite retries`);
          } catch (markError) {
            console.error(`❌ Failed to mark failed notification as sent:`, markError);
            // Even if marking as sent fails, we continue to prevent system lockup
          }
        }
      }
      
      // Add delay between batches to avoid overwhelming Slack API - REDUCED DELAY
      if (batchIndex < totalBatches - 1) {
        console.log(`⏳ Waiting 1 second before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const results = {
      total: limitedMentions.length,
      success: successCount,
      failed: failureCount,
      batches: totalBatches,
      remaining: pendingMentions.length - limitedMentions.length
    };
    
    console.log('🏁 Slack notification processing completed');
    console.log(`📊 Results: ${results.success} successful, ${results.failed} failed out of ${results.total} processed (${results.batches} batches)`);
    if (results.remaining > 0) {
      console.log(`⏭️ ${results.remaining} notifications remaining - will be processed in next cron run`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error in Slack notification processing:', error);
    throw error;
  }
} 