import axios from "axios";

export async function sendTelegramErrorNotification(message: string) {
  try {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (!telegramToken || !telegramChatId) {
      console.error('Telegram credentials missing. Cannot send Telegram notification.');
      return;
    }
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    await axios.post(url, {
      chat_id: telegramChatId,
      text: message
    }, { timeout: 10000 });
    console.log('✅ Telegram error notification sent');
  } catch (err) {
    console.error('❌ Failed to send Telegram notification:', err);
  }
}

/**
 * Send Telegram notification for brand mention
 * Always sends all mentions (no sentiment filtering)
 */
export async function sendTelegramNotification(
  chatId: string,
  mention: {
    brandName: string;
    keywordMatched: string;
    title?: string;
    content: string;
    subreddit?: string;
    author: string;
    url: string;
    sentiment: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
    };
    itemType: 'post' | 'comment' | 'story';
    platform: 'reddit' | 'hackernews';
    detectedAt?: Date;
  }
) {
  try {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN_USER;
    if (!telegramToken || !chatId) {
      console.error('Telegram credentials or chatId missing. Cannot send Telegram notification.');
      return;
    }
    // Format the message as plain text (no Markdown parsing)
    const sentimentEmojis = {
      positive: '😊',
      negative: '😞',
      neutral: '😐'
    };
    const detectedAt = mention.detectedAt ? new Date(mention.detectedAt) : new Date();
    
    const message =
      `🏷️ Brand: ${mention.brandName}\n` +
      `🔑 Keyword: ${mention.keywordMatched}\n` +
      `📊 Sentiment: ${sentimentEmojis[mention.sentiment.label]}\n` +
      `📱 Platform: ${mention.platform}\n` +
      (mention.platform === 'reddit' ? `📢 Subreddit: r/${mention.subreddit}\n` : '') +
      `👤 Author: ${mention.platform === 'reddit' ? 'u/' : ''}${mention.author}\n` +
      `✏️ Title: ${mention.title}\n` +
      `📝 Content: ${mention.content.substring(0, 300)}${mention.content.length > 300 ? '...' : ''}\n` +
      `🔗 View: ${mention.url}\n` +
      `⏰ Detected: ${detectedAt.toLocaleString()}`;

    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message
    }, { timeout: 10000 });
    console.log('✅ Telegram notification sent');
  } catch (err: any) {
    console.error('❌ Failed to send Telegram notification:', err);
    
    // Log detailed error information for debugging
    if (err.response && err.response.data) {
      console.error('Telegram API Error Details:', err.response.data);
    }
    
    // Re-throw the error so it can be handled by the calling function
    throw err;
  }
}