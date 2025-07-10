import { NextResponse } from 'next/server';
import { runPollingService } from '@/lib/polling-service';

export async function POST() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Polling service started at:', new Date().toISOString());
    
    await runPollingService();
    
    const duration = Date.now() - startTime;
    console.log('✅ Polling service completed in', duration, 'ms');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Polling service executed successfully.',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Error in polling-service endpoint:', error);
    console.error('Duration:', duration, 'ms');
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Optionally allow GET for manual testing
export async function GET() {
  return POST();
}