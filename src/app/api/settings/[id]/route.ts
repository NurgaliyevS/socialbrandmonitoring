import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import { authenticateUser } from '@/lib/auth-middleware';
import { NextResponse, NextRequest } from 'next/server';

// GET - Fetch a specific company by ID (only if user owns it)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }
    
    await connectDB();
    
    // Only allow users to access their own companies
    const company = await Company.findOne({ 
      _id: id,
      user: authResult.user!.id 
    });
    
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found or you do not have access to it'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: company
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update a company (only if user owns it)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }
    
    await connectDB();
    const updateData = await request.json();
    
    // Only allow users to update their own companies
    const company = await Company.findOneAndUpdate(
      { 
        _id: id,
        user: authResult.user!.id 
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found or you do not have access to it'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: company
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete a company (only if user owns it)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }
    
    await connectDB();
    
    // Only allow users to delete their own companies
    const company = await Company.findOneAndDelete({ 
      _id: id,
      user: authResult.user!.id 
    });
    
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found or you do not have access to it'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 