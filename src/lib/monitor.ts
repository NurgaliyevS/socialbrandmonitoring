import connectDB from "./mongodb";
import { checkKeywordMatch, searchPosts } from "./reddit";
import { analyzeSentiment } from "./polling-service";
import Company from "@/models/Company";
import Mention from "@/models/Mention";

/**
 * Get all brands and their keywords from MongoDB
 */
export async function getBrandsAndKeywords() {
  await connectDB();
  // Include brands that have keywords configured, regardless of onboarding status
  const companies = await Company.find({ 
    keywords: { $exists: true, $ne: [] } 
  });

  return companies.map((company) => {
    console.log("company name", company?.name);
    console.log("company website", company?.website);
    console.log("keywords", company.keywords.map((k: any) => k.name));
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
      console.log(`🔍 Searching for mentions of "${brand.brandName}" with keywords: ${brand.keywords.join(', ')}`);
      
      for (const keyword of brand.keywords) {
        try {
          // Search for posts containing the keyword
          const posts = await searchPosts(keyword, 1000);
          allPosts.push(...posts);
          
          console.log(`📝 Found ${posts.length} posts for keyword "${keyword}"`);
        } catch (error) {
          console.error(`❌ Error searching for keyword "${keyword}":`, error);
        }
      }
    }

    console.log(
      `📝 Total posts found: ${allPosts.length}`
    );

    const newMentions = [];

    // Check posts for keyword matches
    for (const post of allPosts) {
      const content = `${post.title} ${post.selftext}`;

      for (const brand of brands) {
        const matchedKeyword = checkKeywordMatch(content, brand.keywords);

        if (matchedKeyword) {
          const mention = {
            brandId: brand.brandId,
            keywordMatched: matchedKeyword,
            redditId: post.id,
            redditType: "post",
            subreddit: post.subreddit,
            author: post.author,
            title: post.title,
            content: post.selftext || post.title,
            url: post.url,
            permalink: post.permalink,
            score: post.score,
            numComments: post.numComments,
            created: post.created,
            sentiment: analyzeSentiment(post.selftext || post.title),
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
