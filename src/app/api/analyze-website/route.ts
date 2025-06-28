import { scrapeWebsite } from '@/lib/scraper';

export async function POST(request: Request) {
  try {
    const { website } = await request.json();
    
    // Validate URL
    const url = new URL(website);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    const scrapedData = await scrapeWebsite(website);
    
    return Response.json({
      success: true,
      data: scrapedData
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
} 