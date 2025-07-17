import connectDB from "./mongodb";
import { checkKeywordMatch, searchPosts, fetchAllNewComments } from "./reddit";
import { analyzeSentiment } from "./polling-service";
import { analyzeCommentSentiment } from "./comments-polling-service";
import Company from "@/models/Company";
import Mention from "@/models/Mention";

// Timeout constants for monitoring operations
const MONITORING_TIMEOUT = 240000; // 4 minutes (leaving 40 seconds for other operations)
const MAX_POSTS_PER_KEYWORD = 500; // Reduce from 1000 to prevent timeouts
const MAX_COMMENTS_PER_FETCH = 100; // Reduce from 100 to prevent timeouts

/**
 * Extract the sentence containing the keyword match
 * Returns the sentence with the keyword, or a truncated version if no sentence boundaries found
 */
function extractSentenceWithKeyword(content: string, keyword: string): string {
  if (!content || !keyword) return content;
  
  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  
  // Find the position of the keyword
  const keywordIndex = lowerContent.indexOf(lowerKeyword);
  if (keywordIndex === -1) return content;
  
  // Find sentence boundaries (period, exclamation mark, question mark)
  const sentenceEndings = ['.', '!', '?', '\n'];
  
  // Find the start of the sentence (look backwards for sentence endings)
  let sentenceStart = 0;
  for (let i = keywordIndex; i >= 0; i--) {
    if (sentenceEndings.includes(content[i])) {
      sentenceStart = i + 1;
      break;
    }
  }
  
  // Find the end of the sentence (look forwards for sentence endings)
  let sentenceEnd = content.length;
  for (let i = keywordIndex; i < content.length; i++) {
    if (sentenceEndings.includes(content[i])) {
      sentenceEnd = i + 1;
      break;
    }
  }
  
  // Extract the sentence and trim whitespace
  const sentence = content.slice(sentenceStart, sentenceEnd).trim();
  
  // Make the keyword bold by wrapping it in HTML tags
  const boldSentence = sentence.replace(
    new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
    '<strong>$1</strong>'
  );
  
  // If sentence is too long (more than 300 chars), truncate it
  if (boldSentence.length > 300) {
    return boldSentence.substring(0, 297) + '...';
  }
  
  return boldSentence || content.substring(0, 200) + '...';
}

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
      $group: {
        _id: '$brandId',
        mentionCount: { $sum: 1 }
      }
    }
  ]);

  console.log("mention counts", mentionCounts);

  // Create a map of brandId to mention count
  const mentionCountMap = new Map();
  mentionCounts.forEach((item: any) => {
    console.log("item", item);
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

  return companiesWithMentionCounts.map((company: any) => {
    console.log("company name", company?.name);
    console.log("company website", company?.website);
    console.log("mention count", company.mentionCount);
    console.log(
      "keywords",
      company.keywords.map((k: any) => k.name)
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
        
        try {
          // Search for posts containing the keyword with reduced limit
          const posts = await searchPosts(keyword, MAX_POSTS_PER_KEYWORD);
          allPosts.push(...posts);

          console.log(
            `📝 Found ${posts.length} posts for keyword "${keyword}"`
          );
          
          // Add a small delay between searches to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ Error searching for keyword "${keyword}":`, error);
          
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
          
          // Continue with next keyword instead of failing completely
          continue;
        }
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

      for (const brand of brands) {
        const matchedKeyword = checkKeywordMatch(content, brand.keywords);

        if (matchedKeyword) {
          const fullContent = post.selftext || post.title;
          const extractedContent = extractSentenceWithKeyword(fullContent, matchedKeyword);
          const boldTitle = extractSentenceWithKeyword(post.title, matchedKeyword);
          
          const mention = {
            brandId: brand.brandId,
            keywordMatched: matchedKeyword,
            redditId: post.id,
            redditType: "post",
            subreddit: post.subreddit,
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
            } (${matchedKeyword}) in post: ${post.title.substring(0, 50)}...`
          );
        }
      }
    }

    // Note: We're only searching for posts now, not comments
    // Comments can be added later if needed

    // Save mentions to database
    if (newMentions.length > 0) {
      await connectDB();

      // Step 2: Implement Batching - Split large arrays into chunks of 100
      const batchSize = 100;
      const allExistingIds: string[] = [];
      
      // Process each chunk separately
      for (let i = 0; i < newMentions.length; i += batchSize) {
        // Check timeout during database operations
        if (Date.now() - startTime > MONITORING_TIMEOUT * 0.98) {
          console.log("⚠️ Approaching timeout limit, stopping database operations");
          break;
        }
        
        const batch = newMentions.slice(i, i + batchSize);
        const existingIds = await Mention.find({
          redditId: { $in: batch.map(m => m.redditId) }
        }).distinct("redditId");
        allExistingIds.push(...existingIds);
      }

      // Combine results from all chunks
      const uniqueMentions = newMentions.filter(
        (mention) => !allExistingIds.includes(mention.redditId)
      );

      if (uniqueMentions.length > 0) {
        // Use insertMany with ordered: false to handle any remaining duplicates gracefully
        try {
          await Mention.insertMany(uniqueMentions, { ordered: false });
          console.log(
            `💾 Saved ${uniqueMentions.length} new mentions to database`
          );
        } catch (error: any) {
          // Handle any remaining duplicate errors gracefully
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
        console.log("ℹ️ All mentions already exist in database");
      }
    } else {
      console.log("ℹ️ No new mentions found");
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

    // Fetch new comments from all subreddits with reduced limit
    const allComments = await fetchAllNewComments(MAX_COMMENTS_PER_FETCH);

    console.log(`📝 Total comments fetched: ${allComments.length}`);

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
            redditId: comment.id,
            redditType: "comment",
            subreddit: comment.subreddit,
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

      // Step 2: Implement Batching - Split large arrays into chunks of 100
      const batchSize = 100;
      const allExistingIds: string[] = [];
      
      // Process each chunk separately
      for (let i = 0; i < newMentions.length; i += batchSize) {
        // Check timeout during database operations
        if (Date.now() - startTime > MONITORING_TIMEOUT * 0.98) {
          console.log("⚠️ Approaching timeout limit, stopping database operations");
          break;
        }
        
        const batch = newMentions.slice(i, i + batchSize);
        const existingIds = await Mention.find({
          redditId: { $in: batch.map(m => m.redditId) },
          redditType: "comment",
        }).distinct("redditId");
        allExistingIds.push(...existingIds);
      }

      // Combine results from all chunks
      const uniqueMentions = newMentions.filter(
        (mention) => !allExistingIds.includes(mention.redditId)
      );

      if (uniqueMentions.length > 0) {
        // Use insertMany with ordered: false to handle any remaining duplicates gracefully
        try {
          await Mention.insertMany(uniqueMentions, { ordered: false });
          console.log(
            `💾 Saved ${uniqueMentions.length} new comment mentions to database`
          );
        } catch (error: any) {
          // Handle any remaining duplicate errors gracefully
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
        console.log("ℹ️ All comment mentions already exist in database");
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
