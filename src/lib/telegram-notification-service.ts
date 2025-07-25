import connectDB from './mongodb';
import Mention from '@/models/Mention';
import Company from '@/models/Company';
import { sendTelegramNotification } from './telegram';


/**
 * Get companies that have Telegram notifications enabled and configured
 */
export async function getCompaniesWithTelegramEnabled() {
  try {
    await connectDB();
    
    const companies = await Company.find({
      'telegramConfig.enabled': true,
      'telegramConfig.chatId': { $exists: true, $ne: null },
      $expr: { $ne: ['$telegramConfig.chatId', ''] }
    });
    
    console.log(`📋 Found ${companies.length} companies with Telegram notifications enabled`);
    return companies;
  } catch (error) {
    console.error('❌ [Telegram] Error in getCompaniesWithTelegramEnabled:', error);
    throw error;
  }
}

/**
 * Get mentions that need Telegram notifications
 * Finds mentions that haven't been sent to Telegram yet
 */
export async function getPendingTelegramNotifications() {
  try {
    await connectDB();
    
    // First, get companies with Telegram enabled
    const telegramCompanies = await getCompaniesWithTelegramEnabled();
    
    if (telegramCompanies.length === 0) {
      console.log('ℹ️ No companies have Telegram notifications enabled');
      return [];
    }
    
    // Get company IDs
    const companyIds = telegramCompanies.map(company => company._id);
    
    // Find mentions that haven't been sent to Telegram yet and belong to companies with Telegram enabled
    const pendingMentions = await Mention.find({
      telegramNotificationSent: { $ne: true },
      brandId: { $in: companyIds },
    }).populate('brandId').limit(50);
  
    console.log(`📋 Found ${pendingMentions.length} pending Telegram notifications for companies with Telegram enabled`);
  
    return pendingMentions;
  } catch (error) {
    console.error('❌ [Telegram] Error in getPendingTelegramNotifications:', error);
    throw error;
  }
}

/**
 * Mark a mention as having been sent to Telegram
 * Updates the mention record to prevent duplicate notifications
 */
export async function markTelegramNotificationSent(mentionId: string) {
  await connectDB();
  try {
    await Mention.findByIdAndUpdate(mentionId, {
      telegramNotificationSent: true,
      telegramNotificationSentAt: new Date()
    });
    console.log(`✅ Marked mention ${mentionId} as Telegram notification sent`);
  } catch (error) {
    console.error(`❌ Failed to mark mention ${mentionId} as sent:`, error);
    throw error;
  }
}

/**
 * Process all pending Telegram notifications
 * Main function that handles the entire notification workflow for Telegram
 */
export async function processPendingTelegramNotifications() {
  console.log('🚀 Starting Telegram notification processing...');
  
  // Check if Telegram bot token is configured
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN_USER;
  if (!telegramToken) {
    console.error('❌ [Telegram] TELEGRAM_BOT_TOKEN_USER environment variable is not set');
    return {
      total: 0,
      success: 0,
      failed: 0,
      error: 'Telegram bot token not configured'
    };
  }
  
  try {
    // Get pending notifications
    const pendingMentions = await getPendingTelegramNotifications();
    if (pendingMentions.length === 0) {
      console.log('ℹ️ No pending Telegram notifications to process');
      return {
        total: 0,
        success: 0,
        failed: 0
      };
    }
    console.log(`📤 Processing ${pendingMentions.length} Telegram notifications...`);
    let successCount = 0;
    let failureCount = 0;
    const batchSize = 5;
    const maxNotifications = 50;
    const limitedMentions = pendingMentions.slice(0, maxNotifications);
    const totalBatches = Math.ceil(limitedMentions.length / batchSize);
    console.log(`📦 Processing ${limitedMentions.length} notifications in ${totalBatches} batches of ${batchSize} each (limited to ${maxNotifications} per run)`);
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, limitedMentions.length);
      const batch = limitedMentions.slice(startIndex, endIndex);
      console.log(`➡️ [Batch ${batchIndex + 1}/${totalBatches}] Starting batch with mentions ${startIndex} to ${endIndex - 1}`);
      for (let mentionIdx = 0; mentionIdx < batch.length; mentionIdx++) {
        const mention = batch[mentionIdx];
        try {
          // Enhanced logging with proper mention identification
          const mentionId = mention.itemId || mention._id.toString();
          const chatId = mention.brandId.telegramConfig.chatId;
          
          // Validate Telegram configuration for this mention
          if (!mention.brandId.telegramConfig?.enabled) {
            console.warn(`⚠️ [Telegram] Skipping mention ${mentionId} - Telegram not enabled for brand ${mention.brandId.name}`);
            continue;
          }
          
          if (!chatId || chatId.trim() === '') {
            console.warn(`⚠️ [Telegram] Skipping mention ${mentionId} - No chat ID configured for brand ${mention.brandId.name}`);
            continue;
          }
          
          // Validate chat ID format - should be a number, not a bot token
          if (chatId.includes(':')) {
            console.error(`❌ [Telegram] INVALID CHAT ID FORMAT for brand ${mention.brandId.name}:`);
            console.error(`    Current value: ${chatId}`);
            console.error(`    This looks like a bot token, not a chat ID!`);
            console.error(`    Chat ID should be a number (e.g., 123456789), not a bot token format.`);
            console.error(`    Please fix the chat ID in the database for brand: ${mention.brandId.name}`);
            failureCount++;
            continue;
          }
          
          console.log(`🔄 [Batch ${batchIndex + 1}] [Mention ${mentionIdx + 1}/${batch.length}] Preparing to send notification:`);
          console.log(`    Mention ID: ${mentionId}`);
          console.log(`    Brand: ${mention.brandId.name}`);
          console.log(`    Keyword: ${mention.keywordMatched}`);
          console.log(`    Platform: ${mention.platform}`);
          console.log(`    Chat ID: ${chatId}`);
          console.log(`    Telegram Config:`, JSON.stringify(mention.brandId.telegramConfig, null, 2));
          
          await sendTelegramNotification(chatId, {
            brandName: mention.brandId.name,
            keywordMatched: mention.keywordMatched,
            title: mention.title,
            content: mention.content,
            subreddit: mention.subreddit,
            author: mention.author,
            url: mention.url,
            sentiment: mention.sentiment,
            itemType: mention.itemType,
            platform: mention.platform,
            detectedAt: mention.createdAt
          });
          console.log(`✅ [Batch ${batchIndex + 1}] [Mention ${mentionIdx + 1}/${batch.length}] Notification sent for mention ${mentionId}`);
          await markTelegramNotificationSent(mention._id.toString());
          console.log(`📝 [Batch ${batchIndex + 1}] [Mention ${mentionIdx + 1}/${batch.length}] Marked as sent in DB for mention ${mentionId}`);
          successCount++;
        } catch (error: any) {
          failureCount++;
          const mentionId = mention.itemId || mention._id.toString();
          const chatId = mention.brandId.telegramConfig.chatId;
          
          console.error(`❌ [Telegram] Failed to send notification for mention ${mentionId}:`);
          console.error(`    Brand: ${mention.brandId.name}`);
          console.error(`    Chat ID: ${chatId}`);
          console.error(`    Error:`, error);
          
          // Enhanced error logging with specific Telegram error handling
          if (error.response && error.response.data) {
            console.error(`    Telegram API Error:`, error.response.data);
            
            if (error.response.status === 403) {
              console.error('❗ [Telegram] 403 Forbidden - Possible issues:');
              console.error('    - Bot token is invalid or expired');
              console.error('    - Chat ID is incorrect');
              console.error('    - Bot was blocked by the user');
              console.error('    - Bot doesn\'t have permission to send messages to this chat');
            }
            
            if (error.response.data.description) {
              const description = error.response.data.description;
              if (description.includes('chat not found')) {
                console.error('❗ [Telegram] Invalid chat ID:', chatId);
              }
              if (description.includes('bot was blocked by the user')) {
                console.error('❗ [Telegram] Bot was blocked by the user');
              }
              if (description.includes('Too Many Requests')) {
                console.error('❗ [Telegram] Rate limit hit. Consider retrying later');
              }
              if (description.includes('Forbidden')) {
                console.error('❗ [Telegram] Bot forbidden from sending messages to this chat');
              }
            }
            
            if (error.response.data.error_code === 401) {
              console.error('❗ [Telegram] Invalid bot token');
            }
            if (error.response.data.error_code === 403) {
              console.error('❗ [Telegram] Bot forbidden (403) - check bot permissions and chat ID');
            }
          } else {
            console.error(`    Generic Error:`, error.message || error);
          }
          
          // Track failure count for this mention (simulate with a local property)
          mention._telegramFailureCount = (mention._telegramFailureCount || 0) + 1;
          if (mention._telegramFailureCount >= 3) {
            console.warn(`🚨 [ADMIN ALERT] Mention ${mentionId} failed to send to Telegram 3 or more times. Please investigate.`);
            console.warn(`    Brand: ${mention.brandId.name}, Chat ID: ${chatId}`);
          }
          
          // Mark as sent even if notification fails to prevent infinite retries
          try {
            await markTelegramNotificationSent(mention._id.toString());
            console.log(`⚠️ [Telegram] Marked failed notification as sent to prevent infinite retries`);
          } catch (markError) {
            console.error(`❌ [Telegram] Failed to mark failed notification as sent:`, markError);
          }
        }
      }
      console.log(`⏹️ [Batch ${batchIndex + 1}/${totalBatches}] Finished batch with mentions ${startIndex} to ${endIndex - 1}`);
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
    console.log('🏁 Telegram notification processing completed');
    console.log(`📊 [Telegram] Results: ${results.success} successful, ${results.failed} failed out of ${results.total} processed (${results.batches} batches)`);
    if (results.remaining > 0) {
      console.log(`⏭️ ${results.remaining} notifications remaining - will be processed in next cron run`);
    }
    return results;
  } catch (error) {
    console.error('❌ [Telegram] Error in Telegram notification processing:', error);
    throw error;
  }
} 