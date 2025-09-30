import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldMentions, getMentionStats } from '../../../lib/mention-cleanup-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Mention cleanup cron job started');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const daysToKeep = parseInt(searchParams.get('days') || '30');
    const dryRun = searchParams.get('dryRun') === 'true';
    
    // Get stats before cleanup
    const statsBefore = await getMentionStats();
    console.log('📊 Stats before cleanup:', statsBefore);
    
    // Perform cleanup (with dryRun parameter)
    const result = await cleanupOldMentions(daysToKeep, dryRun);
    
    // Get stats after cleanup
    const statsAfter = await getMentionStats();
    console.log('📊 Stats after cleanup:', statsAfter);
    
    return NextResponse.json({
      success: true,
      message: result.message,
      deleted: result.deleted,
      statsBefore,
      statsAfter
    });
    
  } catch (error) {
    console.error('❌ Mention cleanup failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = await getMentionStats();
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error getting mention stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
