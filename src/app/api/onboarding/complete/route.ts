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
      }
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