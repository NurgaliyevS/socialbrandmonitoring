import connectDB from "./mongodb";
import { checkKeywordMatch, searchPosts, fetchAllNewComments } from "./reddit";
import { analyzeSentiment } from "./polling-service";
import { analyzeCommentSentiment } from "./comments-polling-service";
import Company from "@/models/Company";
import Mention from "@/models/Mention";

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
  
  // If sentence is too long (more than 300 chars), truncate it
  if (sentence.length > 300) {
    return sentence.substring(0, 297) + '...';
  }
  
  return sentence || content.substring(0, 200) + '...';
}

/**
 * Get all brands and their keywords from MongoDB
 */
export async function getBrandsAndKeywords() {
  await connectDB();
  // Include brands that have keywords configured, regardless of onboarding status
  const companies = await Company.find({
    keywords: { $exists: true, $ne: [] },
  });

  return companies.map((company) => {
    console.log("company name", company?.name);
    console.log("company website", company?.website);
    console.log(
      "keywords",
      company.keywords.map((k: any) => k.name)
    );
    return {
      brandId: company._id,
      brandName: company.name,
      keywords: company.keywords.map((k: any) => k.name),
    };
  });
}

/**
 * Monitor Reddit content for brand mentions
 * Implementation from PRD Step 2 - Filtering Logic
 */
export async function monitorRedditContent() {
  try {
    console.log("🔍 Starting Reddit content monitoring...");

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
      console.log(
        `🔍 Searching for mentions of "${
          brand.brandName
        }" with keywords: ${brand.keywords.join(", ")}`
      );

      for (const keyword of brand.keywords) {
        try {
          // Search for posts containing the keyword
          const posts = await searchPosts(keyword, 1000);
          allPosts.push(...posts);

          console.log(
            `📝 Found ${posts.length} posts for keyword "${keyword}"`
          );
        } catch (error) {
          console.error(`❌ Error searching for keyword "${keyword}":`, error);
        }
      }
    }

    console.log(`📝 Total posts found: ${allPosts.length}`);

    const newMentions = [];

    // Check posts for keyword matches
    for (const post of allPosts) {
      const content = `${post.title} ${post.selftext}`;

      for (const brand of brands) {
        const matchedKeyword = checkKeywordMatch(content, brand.keywords);

        if (matchedKeyword) {
          const fullContent = post.selftext || post.title;
          const extractedContent = extractSentenceWithKeyword(fullContent, matchedKeyword);
          
          const mention = {
            brandId: brand.brandId,
            keywordMatched: matchedKeyword,
            redditId: post.id,
            redditType: "post",
            subreddit: post.subreddit,
            author: post.author,
            title: post.title,
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

      // Check for duplicates before saving
      const existingIds = await Mention.find({
        redditId: { $in: newMentions.map((m) => m.redditId) },
      }).distinct("redditId");

      const uniqueMentions = newMentions.filter(
        (mention) => !existingIds.includes(mention.redditId)
      );

      if (uniqueMentions.length > 0) {
        await Mention.insertMany(uniqueMentions);
        console.log(
          `💾 Saved ${uniqueMentions.length} new mentions to database`
        );
      } else {
        console.log("ℹ️ All mentions already exist in database");
      }
    } else {
      console.log("ℹ️ No new mentions found");
    }

    console.log("✅ Reddit monitoring completed");
    return newMentions.length;
  } catch (error) {
    console.error("❌ Error monitoring Reddit content:", error);
    throw error;
  }
}

/**
 * Monitor Reddit comments for brand mentions
 * Implementation for comments-specific monitoring
 */
export async function monitorRedditComments() {
  try {
    console.log("🔍 Starting Reddit comments monitoring...");

    // Get brands and keywords from MongoDB
    const brands = await getBrandsAndKeywords();
    if (brands.length === 0) {
      console.log("⚠️ No brands found in database");
      return;
    }

    console.log(`📊 Monitoring ${brands.length} brands for comment mentions`);

    // Fetch new comments from all subreddits
    const allComments = await fetchAllNewComments(100);

    console.log(`📝 Total comments fetched: ${allComments.length}`);

    const newMentions = [];

    // Check comments for keyword matches
    for (const comment of allComments) {
      const content = comment.body || "";

      for (const brand of brands) {
        const matchedKeyword = checkKeywordMatch(content, brand.keywords);

        if (matchedKeyword) {
          const fullContent = comment.body || "";
          const extractedContent = extractSentenceWithKeyword(fullContent, matchedKeyword);
          
          const mention = {
            brandId: brand.brandId,
            keywordMatched: matchedKeyword,
            redditId: comment.id,
            redditType: "comment",
            subreddit: comment.subreddit,
            author: comment.author,
            title: comment.linkTitle, // Parent post title
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

      // Check for duplicates before saving
      const existingIds = await Mention.find({
        redditId: { $in: newMentions.map((m) => m.redditId) },
        redditType: "comment",
      }).distinct("redditId");

      const uniqueMentions = newMentions.filter(
        (mention) => !existingIds.includes(mention.redditId)
      );

      if (uniqueMentions.length > 0) {
        await Mention.insertMany(uniqueMentions);
        console.log(
          `💾 Saved ${uniqueMentions.length} new comment mentions to database`
        );
      } else {
        console.log("ℹ️ All comment mentions already exist in database");
      }
    } else {
      console.log("ℹ️ No new comment mentions found");
    }

    console.log("✅ Reddit comments monitoring completed");
    return newMentions.length;
  } catch (error) {
    console.error("❌ Error monitoring Reddit comments:", error);
    throw error;
  }
}
