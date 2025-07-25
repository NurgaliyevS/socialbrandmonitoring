import { NextRequest, NextResponse } from 'next/server';
import { processPendingTelegramNotifications } from '@/lib/telegram-notification-service';

/**
 * API endpoint for processing Telegram notifications
 * Can be called by cron job to send pending notifications
 */
export async function POST() {
  try {
    console.log('🚀 Telegram notifications API endpoint called');
    
    // Process pending Telegram notifications
    const results = await processPendingTelegramNotifications();
    
    console.log('✅ Telegram notifications API completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Telegram notifications processed successfully',
      results: {
        total: results.total,
        success: results.success,
        failed: results.failed
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in Telegram notifications API:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process Telegram notifications',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(){
  // call POST endpoint
  return await POST();
} 

