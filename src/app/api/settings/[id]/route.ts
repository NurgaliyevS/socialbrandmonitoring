import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';

// GET - Fetch a specific company by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    await connectDB();
    const company = await Company.findById(id);
    
    if (!company) {
      return Response.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: company
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update a company
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    await connectDB();
    const updateData = await request.json();
    
    const company = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!company) {
      return Response.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: company
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete a company
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    await connectDB();
    const company = await Company.findByIdAndDelete(id);
    
    if (!company) {
      return Response.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 