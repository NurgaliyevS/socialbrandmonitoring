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
    const scrapedData = await scrapeWebsite(website);
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