import { Resend } from 'resend';
import Company from '@/models/Company';
import Mention from '@/models/Mention';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email alert for brand mention
 * Implementation from PRD Step 5.2 - Email Alerts
 */
export async function sendEmailAlert(
  brandId: string,
  mention: {
    keywordMatched: string;
    title?: string;
    content: string;
    subreddit?: string; // Make subreddit optional
    author: string;
    url: string;
    sentiment: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
    };
    itemType: 'post' | 'comment' | 'story'; // Use itemType instead of redditType
    platform: 'reddit' | 'hackernews'; // Add platform for source distinction
  }
) {
  try {
    // Get brand configuration
    const brand = await Company.findById(brandId);
    if (!brand || !brand.emailConfig?.enabled || !brand.emailConfig?.recipients?.length) {
      console.log('⚠️ Email alerts not configured for brand:', brandId);
      return;
    }

    // Email subject and body
    const subject = `New ${mention.sentiment.label} mention of ${brand.name} on Reddit`;
    const body = `
      <h2>New ${mention.sentiment.label} mention of ${brand.name}</h2>
      <p><strong>Keyword:</strong> ${mention.keywordMatched}</p>
      <p><strong>Subreddit:</strong> r/${mention.subreddit}</p>
      <p><strong>Author:</strong> u/${mention.author}</p>
      <p><strong>Sentiment Score:</strong> ${mention.sentiment.score}</p>
      <p><strong>Content:</strong><br/>${mention.title ? mention.title + '<br/>' : ''}${mention.content.substring(0, 500)}${mention.content.length > 500 ? '...' : ''}</p>
      <p><a href="${mention.url}">View on Reddit</a></p>
    `;

    // Send email via Resend
    await resend.emails.send({
      from: `Social Brand Monitoring <alerts@socialbrandmonitoring.com>`,
      to: brand.emailConfig.recipients,
      subject,
      html: body,
      replyTo: "nurgasab@gmail.com"
    });
    console.log(`✅ Email alert sent for ${brand.name} mention`);
  } catch (error) {
    console.error('❌ Error sending email alert:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
  const subject = 'Reset your password';
  const html = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Click the link below to set a new password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  await resend.emails.send({
    from: `Social Brand Monitoring <noreply@socialbrandmonitoring.com>`,
    to: email,
    subject,
    html,
    replyTo: "nurgasab@gmail.com"
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
  const subject = 'Verify your email address';
  const html = `
    <h2>Welcome to Social Brand Monitoring!</h2>
    <p>Thank you for creating your account. Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email Address</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p>${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `;

  await resend.emails.send({
    from: `Social Brand Monitoring <noreply@socialbrandmonitoring.com>`,
    to: email,
    subject,
    html,
    replyTo: "nurgasab@gmail.com"
  });
}

/**
 * Send first email alert when user gets 5+ mentions
 * This is a one-time congratulatory email to welcome users
 */
export async function sendFirstEmailAlert(brandId: string, mentionCount: number) {
  try {
    // Get brand configuration
    const brand = await Company.findById(brandId);
    if (!brand || !brand.emailConfig?.enabled || !brand.emailConfig?.recipients?.length) {
      console.log('⚠️ Email alerts not configured for brand:', brandId);
      return;
    }

    // Get recent mentions for examples (last 3 mentions)
    const recentMentions = await Mention.find({ brandId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('keywordMatched subreddit author title content url sentiment');

    // Build recent mentions HTML
    let recentMentionsHtml = '';
    if (recentMentions.length > 0) {
      recentMentionsHtml = `
        <h3>Recent Mentions:</h3>
        ${recentMentions.map((mention: any) => `
          <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #007bff; background-color: #f8f9fa;">
            <p><strong>Keyword:</strong> ${mention.keywordMatched}</p>
            <p><strong>Subreddit:</strong> r/${mention.subreddit}</p>
            <p><strong>Author:</strong> u/${mention.author}</p>
            <p><strong>Sentiment:</strong> ${mention.sentiment.label}</p>
            <p><strong>Content:</strong> ${mention.title ? mention.title + '<br/>' : ''}${mention.content.substring(0, 200)}${mention.content.length > 200 ? '...' : ''}</p>
            <p><a href="${mention.url}" style="color: #007bff;">View on Reddit →</a></p>
          </div>
        `).join('')}
      `;
    }

    // Email subject and body
    const subject = `We found ${mentionCount} mentions of ${brand.name} on Reddit`;
    const dashboardUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`;
    
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\
        <h1>Your brand monitoring is working!</h1>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #155724;">Monitoring Summary:</h3>
          <ul>
            <li><strong>Total Mentions:</strong> ${mentionCount}</li>
            <li><strong>Brand:</strong> ${brand.name}</li>
            <li><strong>Keywords Tracked:</strong> ${brand.keywords.map((k: any) => k.name).join(', ')}</li>
          </ul>
        </div>
        
        ${recentMentionsHtml}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Your Dashboard
          </a>
        </div>
        
        <h3>Tips</h3>
        <ul>
          <li><strong>Monitor sentiment:</strong> Keep an eye on positive and negative mentions</li>
          <li><strong>Engage immediately:</strong> Don't delay responding to mentions</li>
          <li><strong>Check keywords:</strong> If you see old mentions, edit keywords</li>
        </ul>
        
        <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
          Thank you,<br>
          Founder of Social Brand Monitoring<br>
          Sabyr Nurgaliyev
        </p>
      </div>
    `;

    // Send email via Resend
    await resend.emails.send({
      from: `Social Brand Monitoring <alerts@socialbrandmonitoring.com>`,
      to: brand.emailConfig.recipients,
      subject,
      html: body,
      replyTo: "nurgasab@gmail.com"
    });
    
    console.log(`✅ First email alert sent for ${brand.name} (${mentionCount} mentions)`);
  } catch (error) {
    console.error('❌ Error sending first email alert:', error);
    throw error;
  }
}