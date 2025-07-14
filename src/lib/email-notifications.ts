import { Resend } from 'resend';
import Company from '@/models/Company';

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
      from: `Brand Monitor <onboarding@resend.dev>`,
      to: brand.emailConfig.recipients,
      subject,
      html: body
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
    from: process.env.RESEND_FROM_EMAIL || 'no-reply@yourdomain.com',
    to: email,
    subject,
    html,
  });
}