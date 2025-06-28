import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ScrapedData {
  title: string;
  description: string;
  headings: string[];
  bodyText: string;
}

export async function generateKeywords(scrapedData: ScrapedData, website: string) {
  const domain = new URL(website).hostname.replace('www.', '');
  
  console.log('[AI] Starting keyword generation for:', website);
  console.log('[AI] Domain extracted:', domain);
  console.log('[AI] Scraped data summary:', {
    title: scrapedData.title,
    descriptionLength: scrapedData.description.length,
    headingsCount: scrapedData.headings.length,
    bodyTextLength: scrapedData.bodyText.length
  });
  
  const prompt = `
    Analyze this company website and suggest exactly 4 keywords for monitoring:
    
    Website: ${website}
    Title: ${scrapedData.title}
    Description: ${scrapedData.description}
    Main headings: ${scrapedData.headings.slice(0, 5).join(', ')}
    Content sample: ${scrapedData.bodyText.substring(0, 500)}
    
    Rules:
    1. Include the company brand name as "Own Brand"
    2. Include 2-3 main competitors as "Competitor" 
    3. Estimate mentions as "low", "medium", or "high"
    4. Assign colors: green for own brand, blue/purple/yellow for competitors
    
    Return ONLY valid JSON in this exact format (no markdown, no code blocks):
    {
      "companyName": "Company Name",
      "keywords": [
        {
          "name": "brand name",
          "type": "Own Brand",
          "mentions": "low",
          "color": "bg-green-500"
        },
        {
          "name": "competitor1",
          "type": "Competitor", 
          "mentions": "medium",
          "color": "bg-blue-500"
        }
      ]
    }
  `;

  try {
    console.log('[AI] Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    console.log('[AI] Raw OpenAI response:', content);
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Clean the response to remove markdown formatting
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '');
    }
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '');
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.replace(/\s*```$/, '');
    }
    
    console.log('[AI] Cleaned content:', cleanedContent);
    
    const result = JSON.parse(cleanedContent);
    console.log('[AI] Parsed result:', result);
    
    // Add IDs to keywords
    result.keywords = result.keywords.map((keyword: any, index: number) => ({
      ...keyword,
      id: `keyword_${Date.now()}_${index}`
    }));
    
    console.log('[AI] Final result with IDs:', result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[AI] Error during keyword generation:', errorMessage);
    console.error('[AI] Full error object:', error);
    throw new Error(`AI analysis failed: ${errorMessage}`);
  }
} 