import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import axios from 'axios';

export async function scrapeWebsite(url: string) {
  let browser;
  try {
    console.log(`[SCRAPER] Starting scrape for URL: ${url}`);
    
    // Use simple, reliable approach that works everywhere (local and serverless)
    // Minimal Puppeteer options with HTTP fallback for maximum compatibility
    const launchOptions: any = {
      headless: true,
      executablePath: await chromium.executablePath(),
      args: chromium.args
    };
    
    // Try to use puppeteer with minimal options
    try {
      browser = await puppeteer.launch(launchOptions);
      console.log('[SCRAPER] Browser launched successfully');
    } catch (launchError) {
      console.log('[SCRAPER] Browser launch failed, going to HTTP fallback');
      throw launchError;
    }
    
    const page = await browser.newPage();
    console.log('[SCRAPER] New page created');
    
    // Hide webdriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
    
    // Set realistic browser headers to avoid being blocked
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1'
    });
    
    // Set timeout to 30 seconds as per PRD
    await page.setDefaultTimeout(30000);
    console.log('[SCRAPER] Timeout set to 30 seconds');
    
    // Navigate to the page and wait for network to be idle
    console.log('[SCRAPER] Navigating to page...');
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
    } catch (error) {
      console.log('[SCRAPER] First attempt failed, trying with domcontentloaded...');
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
    }
    console.log('[SCRAPER] Page loaded successfully');
    
    // Additional 2 second buffer as per PRD
    console.log('[SCRAPER] Waiting 2 seconds for dynamic content...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract data using Puppeteer
    console.log('[SCRAPER] Extracting page data...');
    const scrapedData = await page.evaluate(() => {
      const title = document.title || '';
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
      
      // Get first 10 H1-H3 headings
      const headings = Array.from(document.querySelectorAll('h1, h2'))
        .slice(0, 10)
        .map(el => el.textContent?.trim() || '');
      
      // Get body text from paragraphs (first 2000 chars)
      const paragraphs = Array.from(document.querySelectorAll('p'))
        .map(el => el.textContent?.trim() || '')
        .join(' ');
      
      const bodyText = paragraphs.substring(0, 2000);
      
      return {
        title,
        description,
        keywords,
        headings,
        bodyText
      };
    });
    
    console.log('[SCRAPER] Data extraction completed:', {
      title: scrapedData.title,
      descriptionLength: scrapedData.description.length,
      headingsCount: scrapedData.headings.length,
      bodyTextLength: scrapedData.bodyText.length
    });
    
    console.log('[SCRAPER] All headings found:', scrapedData.headings);
    
    return scrapedData;
    
  } catch (error: unknown) {
    console.error('[SCRAPER] Browser launch failed, falling back to HTTP scraping:', error);
    
    // Fallback to basic HTTP request scraping
    try {
      console.log('[SCRAPER] Starting HTTP fallback scraping...');
      const response = await axios.get(url, {
        timeout: 30000,
        proxy: false, // Disable proxy usage
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      
      const html = response.data;
      console.log('[SCRAPER] HTTP response received, parsing HTML...');
      
      // Basic HTML parsing (very simple)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = descriptionMatch ? descriptionMatch[1].trim() : '';
      
      const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
      const keywords = keywordsMatch ? keywordsMatch[1].trim() : '';
      
      // Extract headings (very basic)
      const headingMatches = html.match(/<h[1-2][^>]*>([^<]+)<\/h[1-2]>/gi);
      const headings = headingMatches ? headingMatches.slice(0, 10).map((h: string) => h.replace(/<[^>]+>/g, '').trim()) : [];
      
      // Extract body text (very basic)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      let bodyText = '';
      if (bodyMatch) {
        // Remove script and style tags
        const cleanBody = bodyMatch[1]
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        bodyText = cleanBody.substring(0, 2000);
      }
      
      console.log('[SCRAPER] HTTP fallback scraping completed');
      console.log(`[SCRAPER] Title: ${title}`);
      console.log(`[SCRAPER] Description: ${description}`);
      console.log(`[SCRAPER] Keywords: ${keywords}`);
      console.log(`[SCRAPER] Headings: ${headings}`);
      console.log(`[SCRAPER] Body Text Length: ${bodyText.length}`);
      
      return {
        title,
        description,
        keywords,
        headings,
        bodyText
      };
    } catch (httpError) {
      console.error('[SCRAPER] HTTP fallback also failed:', httpError);
      
      // Provide more specific error information
      let errorMessage = 'Unknown error occurred';
      if (httpError instanceof Error) {
        errorMessage = httpError.message;
        
        if (errorMessage.includes('timeout')) {
          errorMessage = 'Request timed out. The website may be slow or blocking requests.';
        } else if (errorMessage.includes('ENOTFOUND')) {
          errorMessage = 'Website not found. Please check the URL.';
        } else if (errorMessage.includes('403')) {
          errorMessage = 'Access forbidden. The website may be blocking automated requests.';
        } else if (errorMessage.includes('404')) {
          errorMessage = 'Page not found. Please check the URL.';
        }
      }
      
      throw new Error(`Failed to scrape website: ${errorMessage}`);
    }
  } finally {
    if (browser) {
      console.log('[SCRAPER] Closing browser...');
      try {
        // Set a timeout for browser close
        const closePromise = browser.close();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Browser close timeout')), 5000)
        );
        await Promise.race([closePromise, timeoutPromise]);
        console.log('[SCRAPER] Browser closed successfully');
      } catch (error) {
        console.log('[SCRAPER] Browser close failed, forcing termination');
        // Force kill the browser process
        try {
          await browser.process()?.kill('SIGKILL');
        } catch (killError) {
          console.log('[SCRAPER] Force kill also failed:', killError);
        }
      }
    }
  }
}