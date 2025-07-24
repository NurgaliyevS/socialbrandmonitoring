import connectDB from "./mongodb";
import { checkKeywordMatch, searchPosts } from "./reddit";
import { analyzeSentiment } from "./analyzeSentiment";
import { analyzeCommentSentiment } from "./comments-polling-service";
import { fetchGlobalComments } from "./reddit-global-fetcher";
import Company from "@/models/Company";
import Mention from "@/models/Mention";
import { extractSentenceWithKeyword } from "./extractSentenceWithKeyword";

/**
 * Rate limiting utility with exponential backoff
 */
async function rateLimitedDelay(baseDelay: number, retryCount: number = 0): Promise<void> {
  const delay = baseDelay * Math.pow(RATE_LIMIT_BACKOFF_MULTIPLIER, retryCount);
  console.log(`⏳ Rate limiting delay: ${delay}ms (retry ${retryCount})`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Check if error is a rate limit error
 */
function isRateLimitError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorStatus = error.status || error.response?.status;
  
  return errorStatus === 429 || 
         errorMessage.includes('rate limit') || 
         errorMessage.includes('too many requests') ||
         errorMessage.includes('429');
}

// Timeout constants for monitoring operations
const MONITORING_TIMEOUT = 240000; // 4 minutes (leaving 40 seconds for other operations)
const MAX_POSTS_PER_KEYWORD = 200; // Reduced from 500 to prevent timeouts
const MAX_COMMENTS_PER_FETCH = 100; // Reduce from 100 to prevent timeouts

// Rate limiting constants
const BASE_DELAY_MS = 4000; // 4 seconds between API calls (increased from 500ms)
const MAX_BRANDS_PER_RUN = 5; // Process only 5 brands per run instead of all 21
const RATE_LIMIT_BACKOFF_MULTIPLIER = 2; // Double delay on rate limit errors
const MAX_RATE_LIMIT_RETRIES = 3; // Maximum retries for rate limit errors

/**
 * Get all brands and their keywords from MongoDB, prioritized by mention count
 * Brands with no mentions are processed first
 */
export async function getBrandsAndKeywords() {
  await connectDB();
  
  // First, get all companies with keywords
  const companies = await Company.find({
    keywords: { $exists: true, $ne: [] },
  }).sort({ created: -1 });

  // Get mention counts for each brand
  const mentionCounts = await Mention.aggregate([
    {
      $match: { platform: 'reddit' }
    },
    {
      $group: {
        _id: '$brandId',
        mentionCount: { $sum: 1 }
      }
    }
  ]);

  console.log("🔍 mention counts", mentionCounts);

  // Create a map of brandId to mention count
  const mentionCountMap = new Map();
  mentionCounts.forEach((item: any) => {
    mentionCountMap.set(item._id.toString(), item.mentionCount);
  });

  // Add mention count to each company and sort by mention count (ascending)
  const companiesWithMentionCounts = companies.map((company: any) => {
    const mentionCount = mentionCountMap.get(company._id.toString()) || 0;
    return {
      ...company.toObject(),
      mentionCount
    };
  }).sort((a, b) => a.mentionCount - b.mentionCount);

  console.log("📊 Brands sorted by mention count (ascending):");
  companiesWithMentionCounts.forEach((company: any) => {
    console.log(`  - ${company.name}: ${company.mentionCount} mentions`);
  });

  // Limit the number of brands processed per run
  const limitedBrands = companiesWithMentionCounts.slice(0, MAX_BRANDS_PER_RUN);
  
  console.log(`📊 Processing ${limitedBrands.length} brands out of ${companiesWithMentionCounts.length} total brands`);
  
  return limitedBrands.map((company: any) => {
    console.log("🏢 company name", company?.name);
    console.log("🌐 company website", company?.website);
    console.log("📊 mention count", company.mentionCount);
    console.log(
      "🔑 keywords: ",
      company.keywords.map((k: any) => k.name).join(', ')
    );
    return {
      brandId: company._id,
      brandName: company.name,
      keywords: company.keywords.map((k: any) => k.name),
      mentionCount: company.mentionCount,
    };
  });
}

/**
 * Monitor Reddit content for brand mentions with timeout protection
 * Implementation from PRD Step 2 - Filtering Logic
 */
export async function monitorRedditContent() {
  const startTime = Date.now();
  
  try {
    console.log("🔍 Starting Reddit content monitoring...");
    console.log(`⏰ Monitoring timeout set to ${MONITORING_TIMEOUT}ms`);

    // Get brands and keywords from MongoDB
    const brands = await getBrandsAndKeywords();
    if (brands.length === 0) {
      console.log("⚠️ No brands found in database");
      return;
    }

    console.log(`📊 Monitoring ${brands.length} brands with keywords`);

    // Search for posts containing brand keywords
    const allPosts = [];
    const allComments = [];

    for (const brand of brands) {
      // Check if we're approaching the timeout
      if (Date.now() - startTime > MONITORING_TIMEOUT * 0.8) {
        console.log("⚠️ Approaching timeout limit, stopping brand processing");
        break;
      }
      
      console.log(
        `🔍 Searching for mentions of "${
          brand.brandName
        }" (${brand.mentionCount} existing mentions) with keywords: ${brand.keywords.join(", ")}`
      );

      for (const keyword of brand.keywords) {
        // Check timeout before each keyword search
        if (Date.now() - startTime > MONITORING_TIMEOUT * 0.9) {
          console.log("⚠️ Approaching timeout limit, stopping keyword processing");
          break;
        }
        
        let retryCount = 0;
        let success = false;
        
        while (!success && retryCount <= MAX_RATE_LIMIT_RETRIES) {
          try {
            // Search for posts containing the keyword with reduced limit
            const posts = await searchPosts(keyword, MAX_POSTS_PER_KEYWORD);
            allPosts.push(...posts);

            console.log(
              `📝 Found ${posts.length} posts for keyword "${keyword}"`
            );
            
            success = true;
          } catch (error) {
            retryCount++;
            console.error(`❌ Error searching for keyword "${keyword}" (attempt ${retryCount}):`, error);
            
            // Check if it's a rate limit error
            if (isRateLimitError(error)) {
              console.log(`🚫 Rate limit detected for keyword "${keyword}", backing off...`);
              
              if (retryCount <= MAX_RATE_LIMIT_RETRIES) {
                await rateLimitedDelay(BASE_DELAY_MS, retryCount);
                continue; // Retry after backoff
              } else {
                console.log(`⚠️ Max retries reached for keyword "${keyword}", skipping...`);
                break;
              }
            } else {
              // Log specific error details for debugging
              if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('tunneling socket') || 
                    errorMessage.includes('certificate') || 
                    errorMessage.includes('connection reset') ||
                    errorMessage.includes('econnreset') ||
                    errorMessage.includes('timed out')) {
                  console.log(`🔧 Network connectivity issue detected for keyword "${keyword}"`);
                }
              }
              
              // For non-rate-limit errors, don't retry
              break;
            }
          }
        }
        
        // Add aggressive delay between ALL searches (successful or failed)
        console.log(`⏳ Waiting ${BASE_DELAY_MS}ms before next search...`);
        await new Promise(resolve => setTimeout(resolve, BASE_DELAY_MS));
      }
    }

    console.log(`📝 Total posts found: ${allPosts.length}`);

    const newMentions = [];

    // Check posts for keyword matches
    for (const post of allPosts) {
      // Check timeout during post processing
      if (Date.now() - startTime > MONITORING_TIMEOUT * 0.95) {
        console.log("⚠️ Approaching timeout limit, stopping post processing");
        break;
      }
      
      const content = `${post.title} ${post.selftext}`;
      // Debug: Log the post content being checked
      console.log(`🔍 Checking post: "${post.title.substring(0, 50)}..."`);
      console.log(`📄 Content preview: "${content.substring(0, 50)}..."`);

      for (const brand of brands) {
        console.log(`🔑 Checking keywords for ${brand.brandName}: ${brand.keywords.join(', ')}`);
        const matchedKeyword = checkKeywordMatch(content, brand.keywords);

        if (matchedKeyword) {
          const fullContent = post.selftext || post.title;
          const extractedContent = extractSentenceWithKeyword(fullContent, matchedKeyword);
          const boldTitle = extractSentenceWithKeyword(post.title, matchedKeyword);
          
          const mention = {
            brandId: brand.brandId,
            keywordMatched: matchedKeyword,
            platform: 'reddit',
            itemId: post.id,
            itemType: 'post',
            subreddit: post.subreddit, // Required for Reddit
            author: post.author,
            title: boldTitle,
            content: extractedContent,
            url: post.url,
            permalink: post.permalink,
            score: post.score,
            numComments: post.numComments,
            created: post.created,
            sentiment: analyzeSentiment(fullContent),
            isProcessed: true,
          };

          newMentions.push(mention);
          console.log(
            `✅ Found mention: ${
              brand.brandName
            } \n Keyword: (${matchedKeyword}) \n Post: ${post.title.substring(0, 50)}...`
          );
        }
      }
    }

    // Note: We're only searching for posts now, not comments
    // Comments can be added later if needed

    // Save mentions to database
    if (newMentions.length > 0) {
      await connectDB();

      // Use insertMany with ordered: false to handle duplicates gracefully
      try {
        console.log(`💾 Attempting to save ${newMentions.length} mentions to database...`);
        const result = await Mention.insertMany(newMentions, { ordered: false });
        console.log(
          `💾 Successfully saved ${result.length} new mentions to database`
        );
      } catch (error: any) {
        // Handle duplicate errors gracefully
        if (error.code === 11000) {
          console.log(`⚠️ Some mentions were duplicates and skipped`);
          // Count how many were actually inserted
          const insertedCount = error.result?.insertedDocs?.length || 0;
          console.log(`💾 Successfully saved ${insertedCount} new mentions to database`);
        } else {
          throw error;
        }
      }
    } else {
      console.log(`ℹ️ No new mentions found (processed ${allPosts.length} posts)`);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Reddit monitoring completed in ${duration}ms (${duration / 60000} minutes)`);
    return newMentions.length;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error monitoring Reddit content after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Monitor Reddit comments for brand mentions with timeout protection
 * Implementation for comments-specific monitoring
 */
export async function monitorRedditComments() {
  const startTime = Date.now();
  
  try {
    console.log("🔍 Starting Reddit comments monitoring...");
    console.log(`⏰ Monitoring timeout set to ${MONITORING_TIMEOUT}ms`);

    // Get brands and keywords from MongoDB
    const brands = await getBrandsAndKeywords();
    if (brands.length === 0) {
      console.log("⚠️ No brands found in database");
      return;
    }

    console.log(`📊 Monitoring ${brands.length} brands for comment mentions`);

    // Fetch new comments once globally for all brands
    console.log('🌐 Fetching comments globally for all brands...');
    const globalResult = await fetchGlobalComments(MAX_COMMENTS_PER_FETCH);
    const allComments = globalResult.comments;
    console.log(`📝 Total comments fetched globally: ${allComments.length}`);

    const newMentions = [];

    // Check comments for keyword matches
    for (const comment of allComments) {
      // Check timeout during comment processing
      if (Date.now() - startTime > MONITORING_TIMEOUT * 0.95) {
        console.log("⚠️ Approaching timeout limit, stopping comment processing");
        break;
      }
      
      const content = comment.body || "";

      for (const brand of brands) {
        const matchedKeyword = checkKeywordMatch(content, brand.keywords);

        if (matchedKeyword) {
          const fullContent = comment.body || "";
          const extractedContent = extractSentenceWithKeyword(fullContent, matchedKeyword);
          const boldTitle = extractSentenceWithKeyword(comment.linkTitle, matchedKeyword);
          
          const mention = {
            brandId: brand.brandId,
            keywordMatched: matchedKeyword,
            platform: 'reddit',
            itemId: comment.id,
            itemType: 'comment',
            subreddit: comment.subreddit, // Required for Reddit
            author: comment.author,
            title: boldTitle, // Parent post title with bold keywords
            content: extractedContent,
            url: comment.url,
            permalink: comment.permalink,
            score: comment.score,
            numComments: comment.numComments, // Comments on parent post
            created: comment.created,
            sentiment: analyzeCommentSentiment(fullContent),
            isProcessed: true,
          };
          newMentions.push(mention);
          console.log(
            `✅ Found comment mention: ${
              brand.brandName
            } (${matchedKeyword}) in comment: ${comment.body.substring(
              0,
              50
            )}...`
          );
        }
      }
    }

    // Save mentions to database
    if (newMentions.length > 0) {
      await connectDB();

      // Use insertMany with ordered: false to handle duplicates gracefully
      try {
        console.log(`💾 Attempting to save ${newMentions.length} comment mentions to database...`);
        const result = await Mention.insertMany(newMentions, { ordered: false });
        console.log(
          `💾 Successfully saved ${result.length} new comment mentions to database`
        );
      } catch (error: any) {
        // Handle duplicate errors gracefully
        if (error.code === 11000) {
          console.log(`⚠️ Some comment mentions were duplicates and skipped`);
          // Count how many were actually inserted
          const insertedCount = error.result?.insertedDocs?.length || 0;
          console.log(`💾 Successfully saved ${insertedCount} new comment mentions to database`);
        } else {
          throw error;
        }
      }
    } else {
      console.log("ℹ️ No new comment mentions found");
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Reddit comments monitoring completed in ${duration}ms`);
    return newMentions.length;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error monitoring Reddit comments after ${duration}ms:`, error);
    throw error;
  }
}
