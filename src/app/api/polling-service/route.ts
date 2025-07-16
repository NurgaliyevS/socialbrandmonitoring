import { NextResponse } from 'next/server';
import { runPollingService } from '@/lib/polling-service';

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
    console.log('🔄 Polling service started at:', new Date().toISOString());
    console.log(`⏰ Timeout set to ${TIMEOUT_MS}ms (${TIMEOUT_MS / 1000}s)`);
    
    // Execute polling service with timeout
    await withTimeout(runPollingService(), TIMEOUT_MS);
    
    const duration = Date.now() - startTime;
    console.log('✅ Polling service completed in', duration, 'ms');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Polling service executed successfully.',
      duration: `${duration}ms`,
      durationInMinutes: (duration / 60000).toFixed(2),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Error in polling-service endpoint:', error);
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

// Optionally allow GET for manual testing
export async function GET() {
  return POST();
}