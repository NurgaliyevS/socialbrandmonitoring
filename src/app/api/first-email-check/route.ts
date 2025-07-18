import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import Mention from '@/models/Mention';
import { sendFirstEmailAlert } from '@/lib/email-notifications';

// Vercel timeout is 300 seconds, but we'll set a safety margin
const TIMEOUT_MS = 280000; // 280 seconds (4 minutes 40 seconds)

/**
 * Execute a function with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

export async function POST() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 First email check service started at:', new Date().toISOString());
    console.log(`⏰ Timeout set to ${TIMEOUT_MS}ms (${TIMEOUT_MS / 1000}s)`);
    
    // Execute first email check with timeout
    await withTimeout(checkAndSendFirstEmails(), TIMEOUT_MS);
    
    const duration = Date.now() - startTime;
    console.log('✅ First email check completed in', duration, 'ms');
    
    return NextResponse.json({ 
      success: true, 
      message: 'First email check executed successfully.',
      duration: `${duration}ms`,
      durationInMinutes: (duration / 60000).toFixed(2),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Error in first-email-check endpoint:', error);
    console.error('Duration:', duration, 'ms');
    
    // Check if it's a timeout error
    const isTimeout = error instanceof Error && error.message.includes('timed out');
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      isTimeout,
      timestamp: new Date().toISOString()
    }, { status: isTimeout ? 408 : 500 });
  }
}

/**
 * Check all companies for users who have 5+ mentions but haven't received first email
 * Send first email and update company record
 */
async function checkAndSendFirstEmails() {
  const startTime = Date.now();
  await connectDB();
  
  console.log('🔍 Starting first email eligibility check...');
  
  // Find companies that:
  // 1. Haven't received first email yet (firstEmailSent: false)
  // 2. Have email notifications enabled
  // 3. Have email recipients configured
  const eligibleCompanies = await Company.find({
    firstEmailSent: { $ne: true }, // Not sent yet
    'emailConfig.enabled': true,
    'emailConfig.recipients': { $exists: true, $ne: [] }
  });
  
  console.log(`📊 Found ${eligibleCompanies.length} companies eligible for first email check`);
  
  if (eligibleCompanies.length === 0) {
    console.log('ℹ️ No companies eligible for first email');
    return;
  }
  
  let emailsSent = 0;
  let errors = 0;
  
  // Process each company
  for (const company of eligibleCompanies) {
    try {
      // Check timeout during processing
      if (Date.now() - startTime > TIMEOUT_MS * 0.95) {
        console.log("⚠️ Approaching timeout limit, stopping company processing");
        break;
      }
      
      console.log(`🔍 Checking company: ${company.name} (ID: ${company._id})`);
      
      // Count mentions for this company
      const mentionCount = await Mention.countDocuments({ brandId: company._id });
      
      console.log(`📝 Company ${company.name} has ${mentionCount} mentions`);
      
      // Check if company has 5+ mentions
      if (mentionCount >= 5) {
        console.log(`✅ Company ${company.name} qualifies for first email (${mentionCount} mentions)`);
        
        // Send first email
        await sendFirstEmailAlert(company._id.toString(), mentionCount);
        
        // Update company record
        await Company.findByIdAndUpdate(company._id, {
          firstEmailSent: true,
          firstEmailSentAt: new Date(),
          firstEmailMentionCount: mentionCount
        });
        
        emailsSent++;
        console.log(`✅ First email sent to ${company.emailConfig.recipients} and record updated for ${company.name}`);
      } else {
        console.log(`⏳ Company ${company.name} has ${mentionCount} mentions (needs ${5 - mentionCount} more)`);
      }
      
    } catch (error) {
      errors++;
      console.error(`❌ Error processing company ${company.name}:`, error);
      // Continue with next company instead of failing entire process
    }
  }
  
  console.log(`📊 First email check completed:`);
  console.log(`   - Companies processed: ${eligibleCompanies.length}`);
  console.log(`   - Emails sent: ${emailsSent}`);
  console.log(`   - Errors: ${errors}`);
  
  return {
    companiesProcessed: eligibleCompanies.length,
    emailsSent,
    errors
  };
} 