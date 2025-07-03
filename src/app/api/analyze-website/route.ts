import { scrapeWebsite } from '@/lib/scraper';
import { generateKeywords } from '@/lib/keyword-analyzer';

export async function POST(request: Request) {
  try {
    const { website } = await request.json();
    
    // Validate URL
    const url = new URL(website);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    // Step 1: Scrape the website
    console.log('[API] Starting website scraping...');
    let scrapedData;
    try {
      scrapedData = await scrapeWebsite(website);
      // Detect block or garbage scrape
      if (
        scrapedData.title?.toLowerCase().includes('just a moment') ||
        scrapedData.bodyText?.toLowerCase().includes('verify you are human') ||
        scrapedData.bodyText?.toLowerCase().includes('cloudflare')
      ) {
        scrapedData = {
          title: '',
          description: '',
          headings: [],
          bodyText: ''
        };
      }
    } catch (e) {
      // Scraping failed, use minimal data
      scrapedData = {
        title: '',
        description: '',
        headings: [],
        bodyText: ''
      };
    }
    console.log('[API] Website scraping completed');
    
    // Step 2: Generate keywords using AI
    console.log('[API] Starting AI keyword analysis...');
    const analysisResult = await generateKeywords(scrapedData, website);
    console.log('[API] AI keyword analysis completed');
    
    return Response.json({
      success: true,
      data: {
        scrapedData,
        analysis: analysisResult
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[API] Error:', errorMessage);
    return Response.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
} 