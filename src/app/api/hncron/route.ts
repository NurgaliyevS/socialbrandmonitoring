import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mention from '@/models/Mention';
import Company from '@/models/Company';
import { analyzeSentiment } from '@/lib/analyzeSentiment';
import { sendSlackNotification } from '@/lib/slack-notifications';
import { extractSentenceWithKeyword } from '@/lib/extractSentenceWithKeyword';

// Utility to strip HTML tags from a string
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
}

// Helper to process a single HN item (story or comment)
async function processItem({ item, itemType, companies, platform, keyword }: {
  item: any;
  itemType: 'story' | 'comment';
  companies: any[];
  platform: string;
  keyword: string;
}): Promise<'created' | 'duplicate'> {
  const itemId = String(item.objectID);
  // Check for duplicate
  const exists = await Mention.findOne({ platform, itemId });
  if (exists) {
    return 'duplicate';
  }
  // Prepare content: prefer story_text, comment_text, or text, then strip HTML
  const rawContent = item.story_text || item.comment_text || item.text || '';
  const plainContent = stripHtml(rawContent);
  // Prepare title (strip HTML if present)
  const plainTitle = stripHtml(item.title || '');
  // Sentiment analysis on combined title + content
  const sentiment = analyzeSentiment((plainTitle + ' ' + plainContent).trim());
  // For each brand that matches this keyword, create a mention
  for (const company of companies) {
    const mention = await Mention.create({
      brandId: company._id,
      keywordMatched: keyword,
      platform,
      itemId,
      itemType,
      subreddit: undefined, // Not applicable for HN
      author: item.author || '',
      title: plainTitle,
      content: plainContent,
      url: `https://news.ycombinator.com/item?id=${itemId}`,
      permalink: item.url || `https://news.ycombinator.com/item?id=${itemId}`,
      score: item.points || item.score || 0,
      numComments: item.num_comments || item.children?.length || 0,
      created: new Date((item.created_at_i || item.created_at) * 1000 || Date.now()),
      sentiment,
      isProcessed: true,
      unread: true,
      slackNotificationSent: false
    });
    // Trigger Slack notification if enabled for this brand
    if (company.slackConfig?.enabled && company.slackConfig?.webhookUrl) {
      try {
        await sendSlackNotification(company._id.toString(), {
          keywordMatched: keyword,
          title: plainTitle,
          content: plainContent,
          subreddit: 'Hacker News',
          author: item.author || '',
          url: `https://news.ycombinator.com/item?id=${itemId}`,
          sentiment,
          itemType: 'story',
          platform: 'hackernews'
        });
        mention.slackNotificationSent = true;
        mention.slackNotificationSentAt = new Date();
        await mention.save();
      } catch (err) {
        // Log but do not throw, so the rest of the mentions are processed
        console.error('Slack notification failed for HN mention:', err);
      }
    }
  }
  return 'created';
}

// Process HN search results: deduplicate, create mentions, trigger Slack notifications
async function processHackerNewsResults({ results, company, keyword }: {
  results: { stories: any; comments: any };
  company: any;
  keyword: string;
}) {
  const platform = 'hackernews';
  let created = 0;
  let duplicates = 0;
  for (const story of results.stories.hits || []) {
    const itemId = String(story.objectID);
    // Log for debugging duplicate key errors
    console.log('Attempting to create Mention:', {
      platform,
      itemId,
      legacyRedditId: story.redditId || null,
      storyObject: story
    });
    const exists = await Mention.findOne({ platform, itemId });
    if (exists) {
      duplicates++;
      continue;
    }
    console.log(story.story_text, "story.story_text");
    console.log(story.text, "story.text");
    console.log(story.title, "story.title");
    // Ensure content is always set and non-empty
    let content = story.story_text || story.text || '';
    console.log(content, "content");
    if (!content) content = story.title || '';
    const extractedContent = extractSentenceWithKeyword(content, keyword);
    // Ensure url is always set and non-empty
    let url = `https://news.ycombinator.com/item?id=${itemId}`;
    if (!url) url = story.url;
    const mention = await Mention.create({
      brandId: company.brandId,
      keywordMatched: keyword,
      platform,
      itemId,
      itemType: 'story',
      subreddit: undefined,
      author: story.author || '',
      title: story.title || '',
      content: extractedContent,
      url,
      permalink: story.url || `https://news.ycombinator.com/item?id=${itemId}`,
      score: story.points || story.score || 0,
      numComments: story.num_comments || story.children?.length || 0,
      created: new Date((story.created_at_i || story.created_at) * 1000 || Date.now()),
      sentiment: { score: 0, label: 'neutral' }, // Placeholder, can be improved
      isProcessed: true,
      unread: true,
      slackNotificationSent: false
    });
    if (company.slackConfig?.enabled && company.slackConfig?.webhookUrl) {
      try {
        await sendSlackNotification(company.brandId.toString(), {
          keywordMatched: keyword,
          title: story.title || '',
          content: story.story_text || story.text || '',
          subreddit: 'Hacker News',
          author: story.author || '',
          url: `https://news.ycombinator.com/item?id=${itemId}`,
          sentiment: { score: 0, label: 'neutral' },
          itemType: 'story',
          platform: 'hackernews'
        });
        mention.slackNotificationSent = true;
        mention.slackNotificationSentAt = new Date();
        await mention.save();
      } catch (err) {
        console.error('Slack notification failed for HN mention:', err);
      }
    }
    created++;
  }
  for (const comment of results.comments.hits || []) {
    const itemId = String(comment.objectID);
    // Log for debugging duplicate key errors
    console.log('Attempting to create Mention:', {
      platform,
      itemId,
      legacyRedditId: comment.redditId || null,
      commentObject: comment
    });
    const exists = await Mention.findOne({ platform, itemId });
    if (exists) {
      duplicates++;
      continue;
    }
    // Ensure content is always set and non-empty
    let content = comment.comment_text || comment.text || '';
    if (!content) content = '';
    const extractedCommentContent = extractSentenceWithKeyword(content, keyword);
    // Ensure url is always set and non-empty for comments
    let url = `https://news.ycombinator.com/item?id=${itemId}`;
    if (!url) url = comment.story_url;
    const mention = await Mention.create({
      brandId: company.brandId,
      keywordMatched: keyword,
      platform,
      itemId,
      itemType: 'comment',
      subreddit: undefined,
      author: comment.author || '',
      title: '',
      content: extractedCommentContent,
      url,
      permalink: comment.story_url || `https://news.ycombinator.com/item?id=${itemId}`,
      score: comment.points || comment.score || 0,
      numComments: comment.num_comments || comment.children?.length || 0,
      created: new Date((comment.created_at_i || comment.created_at) * 1000 || Date.now()),
      sentiment: { score: 0, label: 'neutral' }, // Placeholder, can be improved
      isProcessed: true,
      unread: true,
      slackNotificationSent: false
    });
    if (company.slackConfig?.enabled && company.slackConfig?.webhookUrl) {
      try {
        await sendSlackNotification(company.brandId.toString(), {
          keywordMatched: keyword,
          title: '',
          content: comment.comment_text || comment.text || '',
          subreddit: 'Hacker News',
          author: comment.author || '',
          url: `https://news.ycombinator.com/item?id=${itemId}`,
          sentiment: { score: 0, label: 'neutral' },
          itemType: 'comment',
          platform: 'hackernews'
        });
        mention.slackNotificationSent = true;
        mention.slackNotificationSentAt = new Date();
        await mention.save();
      } catch (err) {
        console.error('Slack notification failed for HN mention:', err);
      }
    }
    created++;
  }
  return { created, duplicates };
}

// Utility to safely process HN results for a company/keyword, logging errors and always returning a result
async function safeProcessHackerNewsResults(args: { results: { stories: any; comments: any }; company: any; keyword: string }) {
  try {
    const res = await processHackerNewsResults(args);
    return { ...res, error: null };
  } catch (error) {
    console.error('Error processing HN results for', {
      brandId: args.company.brandId,
      keyword: args.keyword,
      error: (error as Error).message
    });
    return { created: 0, duplicates: 0, error: (error as Error).message };
  }
}

// Summarize results from all HN cron processing
function summarizeHNCronResults(results: Array<{ created: number; duplicates: number; error?: string | null }>, companiesCount: number, keywordsCount: number) {
  const totalCreated = results.reduce((sum, r) => sum + (r.created || 0), 0);
  const totalDuplicates = results.reduce((sum, r) => sum + (r.duplicates || 0), 0);
  const errors = results.filter(r => r.error).map(r => r.error);
  return {
    companiesProcessed: companiesCount,
    keywordsProcessed: keywordsCount,
    mentionsCreated: totalCreated,
    duplicatesSkipped: totalDuplicates,
    errors
  };
}

// Fetch all companies with at least one keyword
async function fetchAllCompaniesWithKeywords() {
  return Company.find({ keywords: { $exists: true, $ne: [] } });
}

// Returns an array of { brandId, keywords } for each company
async function getCompanyKeywordsMap() {
  const companies = await fetchAllCompaniesWithKeywords();
  return companies.map((company: any) => ({
    brandId: company._id,
    keywords: (company.keywords || []).map((k: any) => k.name)
  }));
}

// Search Hacker News stories and comments for a given keyword using Algolia API
async function searchHackerNewsForKeyword(keyword: string) {
  // Wrap keyword in double quotes and enable advanced syntax for exact phrase matching
  const encodedKeyword = encodeURIComponent('"' + keyword + '"');
  const storyUrl = `https://hn.algolia.com/api/v1/search?query=${encodedKeyword}&tags=story&advancedSyntax=true`;
  const commentUrl = `https://hn.algolia.com/api/v1/search?query=${encodedKeyword}&tags=comment&advancedSyntax=true`;
  const [storyRes, commentRes] = await Promise.all([
    fetch(storyUrl),
    fetch(commentUrl)
  ]);
  if (!storyRes.ok || !commentRes.ok) {
    throw new Error('Failed to fetch from Hacker News Algolia API');
  }
  const [stories, comments] = await Promise.all([
    storyRes.json(),
    commentRes.json()
  ]);
  return { stories, comments };
}

export async function GET(req: NextRequest) {

  await connectDB();

  // Fetch all companies and their keywords
  const companyKeywordMap = await getCompanyKeywordsMap();
  let results: Array<{ created: number; duplicates: number; error?: string | null }> = [];
  let totalKeywords = 0;

  console.log(companyKeywordMap, "companyKeywordMap");

  for (const company of companyKeywordMap) {
    for (const keyword of company.keywords) {
      totalKeywords++;
      try {
        const hnResults = await searchHackerNewsForKeyword(keyword);
        const res = await safeProcessHackerNewsResults({ results: hnResults, company, keyword });
        results.push(res);
      } catch (error) {
        results.push({ created: 0, duplicates: 0, error: (error as Error).message });
      }
    }
  }

  console.log(results, "results");

  const summary = summarizeHNCronResults(results, companyKeywordMap.length, totalKeywords);
  return NextResponse.json(summary);
} 