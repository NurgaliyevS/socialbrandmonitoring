import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const website = searchParams.get('website');
    if (!website) {
      return Response.json({ success: false, error: 'Missing website parameter' }, { status: 400 });
    }
    const company = await Company.findOne({ website });
    if (!company) {
      return Response.json({ success: true, onboardingComplete: false });
    }
    return Response.json({ success: true, onboardingComplete: !!company.onboardingComplete });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 