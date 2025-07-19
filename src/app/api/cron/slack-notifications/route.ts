import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron job endpoint for Slack notifications
 * This endpoint is designed to be called by a cron job every 5-10 minutes
 * It calls the Slack notifications API and provides monitoring/logging
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const jobId = `slack-cron-${Date.now()}`;
  
  console.log(`🚀 [${jobId}] Cron job started for Slack notifications`);
  
  try {
    // Verify this is a legitimate cron job request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log(`❌ [${jobId}] Unauthorized cron job attempt`);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized',
          jobId 
        }, 
        { status: 401 }
      );
    }
    
    console.log(`✅ [${jobId}] Cron job authenticated successfully`);
    
    // Call the Slack notifications API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const slackNotificationsUrl = `${baseUrl}/api/slack-notifications`;
    
    console.log(`📞 [${jobId}] Calling Slack notifications API: ${slackNotificationsUrl}`);
    
    const response = await fetch(slackNotificationsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    const duration = Date.now() - startTime;
    
    if (response.ok && responseData.success) {
      console.log(`✅ [${jobId}] Cron job completed successfully in ${duration}ms`);
      console.log(`📊 [${jobId}] Results: ${responseData.results.success} successful, ${responseData.results.failed} failed out of ${responseData.results.total} processed`);
      
      if (responseData.results.remaining > 0) {
        console.log(`⏭️ [${jobId}] ${responseData.results.remaining} notifications remaining - will be processed in next run`);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Slack notifications cron job completed successfully',
        jobId,
        duration: `${duration}ms`,
        results: responseData.results,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error(`❌ [${jobId}] Slack notifications API failed:`, responseData);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Slack notifications API failed',
          jobId,
          duration: `${duration}ms`,
          error: responseData.message || 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${jobId}] Cron job failed after ${duration}ms:`, error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Cron job failed',
        jobId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for the cron job
 * Useful for monitoring if the cron job endpoint is accessible
 */
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Slack notifications cron job endpoint is running',
    endpoints: {
      GET: '/api/cron/slack-notifications - Execute cron job',
      POST: '/api/cron/slack-notifications - Health check'
    },
    timestamp: new Date().toISOString()
  });
} 