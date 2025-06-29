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
  You are an expert marketing analyst. Your task is to analyze a company’s website content and extract **exactly 4 keywords** for monitoring.
  
  ### Context
  - Website: ${website}
  - Title: ${scrapedData.title}
  - Meta description: ${scrapedData.description}
  - Headings: ${scrapedData.headings.slice(0, 5).join(', ')}
  - Body text sample: ${scrapedData.bodyText.substring(0, 500)}
  
  ### Instructions
  1. Identify the **company’s brand name** and mark it as **"Own Brand"**.
  2. Identify **2 or 3 realistic competitors** in the same space and mark each as a **"Competitor"**.
  3. For each keyword, estimate the **level of online mentions**: "low", "medium", or "high".
  4. Assign a background color:
     - **Own Brand** → "bg-green-500"
     - **Competitors** → Use one of: "bg-blue-500", "bg-purple-500", or "bg-yellow-500"
  
  ### Output Format
  Return **only valid, minified JSON** (no markdown, no explanation, no code block). Use this exact structure:
  
  {
    "companyName": "Acme Inc.",
    "keywords": [
      {
        "name": "acme",
        "type": "Own Brand",
        "mentions": "medium",
        "color": "bg-green-500"
      },
      {
        "name": "competitor1",
        "type": "Competitor",
        "mentions": "high",
        "color": "bg-blue-500"
      },
      {
        "name": "competitor2",
        "type": "Competitor",
        "mentions": "low",
        "color": "bg-yellow-500"
      },
      {
        "name": "competitor3",
        "type": "Competitor",
        "mentions": "medium",
        "color": "bg-purple-500"
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