import { NextResponse } from 'next/server';
import { runPollingService } from '@/lib/polling-service';

export async function POST() {
  try {
    await runPollingService();
    return NextResponse.json({ success: true, message: 'Polling service executed successfully.' });
  } catch (error) {
    console.error('❌ Error in polling-service endpoint:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// Optionally allow GET for manual testing
export async function GET() {
  return POST();
} 