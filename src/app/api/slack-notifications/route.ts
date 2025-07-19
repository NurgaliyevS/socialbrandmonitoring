import { NextRequest, NextResponse } from 'next/server';
import { processPendingSlackNotifications } from '@/lib/slack-notification-service';

/**
 * API endpoint for processing Slack notifications
 * Can be called by cron job to send pending notifications
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Slack notifications API endpoint called');
    
    // Process pending Slack notifications
    const results = await processPendingSlackNotifications();
    
    console.log('✅ Slack notifications API completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Slack notifications processed successfully',
      results: {
        total: results.total,
        success: results.success,
        failed: results.failed
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in Slack notifications API:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process Slack notifications',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking status
 * Useful for monitoring and health checks
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Slack notifications API status check');
    
    return NextResponse.json({
      success: true,
      message: 'Slack notifications API is running',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      endpoints: {
        POST: '/api/slack-notifications - Process pending notifications',
        GET: '/api/slack-notifications - Health check'
      }
    });
    
  } catch (error) {
    console.error('❌ Error in Slack notifications API health check:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Slack notifications API health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 