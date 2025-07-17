import { NextRequest, NextResponse } from 'next/server';
import { getRedditAfterToken, setRedditAfterToken, fetchNewCommentsWithPagination } from '@/lib/reddit-pagination';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Company ID is required' 
      }, { status: 400 });
    }
    
    const afterToken = await getRedditAfterToken(companyId);
    
    return NextResponse.json({
      success: true,
      data: {
        companyId,
        afterToken
      }
    });
  } catch (error) {
    console.error('Error getting Reddit pagination state:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get pagination state' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { companyId, afterToken } = body;
    
    if (!companyId || !afterToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Company ID and after token are required' 
      }, { status: 400 });
    }
    
    await setRedditAfterToken(companyId, afterToken);
    
    return NextResponse.json({
      success: true,
      message: 'Pagination state updated successfully'
    });
  } catch (error) {
    console.error('Error setting Reddit pagination state:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to set pagination state' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { companyId, limit = 100 } = body;
    
    if (!companyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Company ID is required' 
      }, { status: 400 });
    }
    
    const result = await fetchNewCommentsWithPagination(companyId, limit);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching comments with pagination:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch comments' 
    }, { status: 500 });
  }
} 