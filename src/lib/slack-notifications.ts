import { WebClient } from '@slack/web-api';
import Company from '@/models/Company';

/**
 * Send Slack notification for brand mention
 * Implementation from PRD Step 5.1 - Slack Alerts
 */
export async function sendSlackNotification(
  brandId: string,
  mention: {
    keywordMatched: string;
    title?: string;
    content: string;
    subreddit: string;
    author: string;
    url: string;
    sentiment: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
    };
  }
) {
  try {
    // Get brand configuration
    const brand = await Company.findById(brandId);
    if (!brand || !brand.slackConfig?.enabled || !brand.slackConfig?.webhookUrl) {
      console.log('⚠️ Slack notifications not configured for brand:', brandId);
      return;
    }

    // Initialize Slack client
    const slack = new WebClient(brand.slackConfig.webhookUrl);
    
    // Create message text
    const sentimentEmoji = mention.sentiment.label === 'positive' ? '😊' : 
                          mention.sentiment.label === 'negative' ? '😞' : '😐';
    
    const message = {
      channel: brand.slackConfig.channel || '#monitoring',
      text: `New ${mention.sentiment.label} mention of ${brand.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${sentimentEmoji} New ${mention.sentiment.label} mention of ${brand.name}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Keyword:* ${mention.keywordMatched}`
            },
            {
              type: 'mrkdwn',
              text: `*Subreddit:* r/${mention.subreddit}`
            },
            {
              type: 'mrkdwn',
              text: `*Author:* u/${mention.author}`
            },
            {
              type: 'mrkdwn',
              text: `*Sentiment Score:* ${mention.sentiment.score}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Content:* ${mention.title ? mention.title + '\n' : ''}${mention.content.substring(0, 200)}${mention.content.length > 200 ? '...' : ''}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View on Reddit'
              },
              url: mention.url,
              style: mention.sentiment.label === 'negative' ? 'danger' : 'primary'
            }
          ]
        }
      ]
    };

    // Send message to Slack
    await slack.chat.postMessage(message);
    console.log(`✅ Slack notification sent for ${brand.name} mention`);
    
  } catch (error) {
    console.error('❌ Error sending Slack notification:', error);
    throw error;
  }
}

/**
 * Test Slack connection
 */
export async function testSlackConnection(brandId: string): Promise<boolean> {
  try {
    const brand = await Company.findById(brandId);
    if (!brand || !brand.slackConfig?.enabled || !brand.slackConfig?.webhookUrl) {
      return false;
    }

    const slack = new WebClient(brand.slackConfig.webhookUrl);
    await slack.chat.postMessage({
      channel: brand.slackConfig.channel || '#monitoring',
      text: '🧪 Test message from Reddit Brand Monitor'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Slack connection test failed:', error);
    return false;
  }
} 