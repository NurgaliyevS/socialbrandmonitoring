import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { website, keywords, companyName, scrapedData } = await request.json();

    const company = new Company({
      name: companyName,
      website,
      title: scrapedData.title,
      description: scrapedData.description,
      keywords,
      scrapedData: {
        headings: scrapedData.headings,
        bodyText: scrapedData.bodyText
      },
      onboardingComplete: true
    });

    await company.save();

    return Response.json({
      success: true,
      companyId: company._id
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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
      return Response.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    return Response.json({ success: true, data: company });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { website, keywords, companyName, scrapedData } = await request.json();
    if (!website) {
      return Response.json({ success: false, error: 'Missing website parameter' }, { status: 400 });
    }
    const company = await Company.findOne({ website });
    if (!company) {
      return Response.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    company.name = companyName;
    company.title = scrapedData.title;
    company.description = scrapedData.description;
    company.keywords = keywords;
    company.scrapedData = {
      headings: scrapedData.headings,
      bodyText: scrapedData.bodyText
    };
    await company.save();
    return Response.json({ success: true, data: company });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const website = searchParams.get('website');
    if (!website) {
      return Response.json({ success: false, error: 'Missing website parameter' }, { status: 400 });
    }
    const result = await Company.deleteOne({ website });
    if (result.deletedCount === 0) {
      return Response.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 