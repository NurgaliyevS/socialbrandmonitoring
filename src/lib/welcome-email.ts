import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, code: string, password: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Social Brand Monitoring <noreply@socialbrandmonitoring.com>',
      to: [email],
      subject: 'Welcome! Your AppSumo Code is Redeemed',
      replyTo: "nurgasab@gmail.com",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; text-align: center;">Welcome to Social Brand Monitoring!</h1>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your code ${code} has been redeemed successfully!</strong></p>
            <p>You now have <strong>lifetime access</strong> to Social Brand Monitoring.</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Your Login Details:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
              Please save these credentials for future logins.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Login to Dashboard
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Need help?</strong> Reply to this email and we'll get back to you as soon as possible.</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for choosing Social Brand Monitoring!
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }

    console.log('Welcome email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
} 