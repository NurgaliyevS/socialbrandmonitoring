import puppeteer from 'puppeteer';

export async function scrapeWebsite(url: string) {
  let browser;
  try {
    console.log(`[SCRAPER] Starting scrape for URL: ${url}`);
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
    console.log('[SCRAPER] Browser launched successfully');
    
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
    console.error('[SCRAPER] Error during scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to scrape website: ${errorMessage}`);
  } finally {
    if (browser) {
      console.log('[SCRAPER] Closing browser...');
      await browser.close();
      console.log('[SCRAPER] Browser closed successfully');
    }
  }
} 