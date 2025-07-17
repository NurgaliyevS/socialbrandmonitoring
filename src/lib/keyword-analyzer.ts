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
  You are an expert marketing analyst. Analyze the provided website content and extract **exactly 5 keywords** for competitive monitoring.
  
  ### Website Data
  - URL: ${website}
  - Company: ${scrapedData.title}
  - Description: ${scrapedData.description}
  ${scrapedData.headings.length > 0 ? `- Key Headings: ${scrapedData.headings.slice(0, 5).join(', ')}` : ''}
  ${scrapedData.bodyText.length > 0 ? `- Content Sample: ${scrapedData.bodyText.substring(0, 500)}` : ''}
  
  ### Keyword Requirements
  Extract exactly 5 keywords in this order:
  1. **Own Brand** (1 keyword): The company's primary brand name or trademark
  2. **Competitors** (2 keywords): Direct competitors offering similar products/services
  3. **Industry Terms** (2 keywords): Relevant sector-specific terminology or product categories
  
  ### Mention Volume Guidelines
  Estimate online mention frequency based on market presence:
  - **"high"**: Major brands, popular industry terms (1000+ monthly mentions)
  - **medium"**: Established companies, common terms (100-1000 monthly mentions)  
  - **"low"**: Niche players, specialized terms (<100 monthly mentions)
  
  ### Color Coding Rules
  - **Own Brand**: "bg-green-500"
  - **Competitor 1**: "bg-blue-500"
  - **Competitor 2**: "bg-purple-500"
  - **Industry Term 1**: "bg-red-500"
  - **Industry Term 2**: "bg-orange-500"
  
  ### Critical Instructions
  - Return ONLY valid JSON (no markdown, explanations, or code blocks)
  - Use lowercase for all keyword names
  - Ensure keywords are realistic and monitorable
  - Base competitor selection on actual market research
  - Verify industry terms are commonly used in the sector
  
  ### Required JSON Structure
  {
    "companyName": "Company Name Here",
    "keywords": [
      {
        "name": "brandname",
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
        "mentions": "medium", 
        "color": "bg-purple-500"
      },
      {
        "name": "industryterm1",
        "type": "Industry",
        "mentions": "high",
        "color": "bg-red-500"
      },
      {
        "name": "industryterm2", 
        "type": "Industry",
        "mentions": "medium",
        "color": "bg-orange-500"
      }
    ]
  }`;

  console.log("prompt", prompt);

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