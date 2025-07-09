import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';

// GET - Fetch all companies
export async function GET() {
  try {
    await connectDB();
    const companies = await Company.find({}).select('name website keywords slackConfig emailConfig onboardingComplete');
    
    return Response.json({
      success: true,
      data: companies
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create a new company
export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, website } = await request.json();

    if (!name || !website) {
      return Response.json({
        success: false,
        error: 'Name and website are required'
      }, { status: 400 });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ website });
    if (existingCompany) {
      return Response.json({
        success: false,
        error: 'Company with this website already exists'
      }, { status: 409 });
    }

    const company = new Company({
      name,
      website,
      keywords: [],
      slackConfig: {
        enabled: false,
        webhookUrl: '',
        channel: '#monitoring'
      },
      emailConfig: {
        enabled: false,
        recipients: []
      },
      onboardingComplete: false
    });

    await company.save();

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