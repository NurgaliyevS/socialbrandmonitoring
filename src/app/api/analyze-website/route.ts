import { scrapeWebsite } from '@/lib/scraper';
import { generateKeywords } from '@/lib/keyword-analyzer';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { website } = await request.json();
    
    // Validate URL
    const url = new URL(website);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    // Basic rate limiting: Check if user has analyzed recently
    const userEmail = request.user!.email;
    const rateLimitKey = `analyze_website:${userEmail}`;
    
    // Simple in-memory rate limiting (in production, use Redis)
    const now = Date.now();
    const lastRequest = (global as any).rateLimit?.[rateLimitKey] || 0;
    const timeWindow = 60 * 1000; // 1 minute
    
    if (now - lastRequest < timeWindow) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please wait before analyzing another website.'
      }, { status: 429 });
    }
    
    // Update rate limit
    if (!(global as any).rateLimit) {
      (global as any).rateLimit = {};
    }
    (global as any).rateLimit[rateLimitKey] = now;
    
    // Step 1: Scrape the website
    console.log('[API] Starting website scraping for user:', userEmail);
    let scrapedData;
    try {
      // Use proxy if available in environment
      const proxyUrl = process.env.PROXY_URL;
      scrapedData = await scrapeWebsite(website, proxyUrl);
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
    console.log('[API] Website scraping completed for user:', userEmail);
    
    // Step 2: Generate keywords using AI
    console.log('[API] Starting AI keyword analysis for user:', userEmail);
    const analysisResult = await generateKeywords(scrapedData, website);
    console.log('[API] AI keyword analysis completed for user:', userEmail);
    
    return NextResponse.json({
      success: true,
      data: {
        scrapedData,
        analysis: analysisResult
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[API] Error:', errorMessage);
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}); 