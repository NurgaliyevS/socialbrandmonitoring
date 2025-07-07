import connectDB from "./mongodb";
import { fetchNewPosts, fetchNewComments, checkKeywordMatch } from "./reddit";
import { analyzeSentiment } from "./polling-service";
import Company from "@/models/Company";
import Mention from "@/models/Mention";

/**
 * Get all brands and their keywords from MongoDB
 */
export async function getBrandsAndKeywords() {
  await connectDB();
  const companies = await Company.find({ onboardingComplete: true });

  return companies.map((company) => {
    console.log("company name", company?.name);
    console.log("company website", company?.website);
    return {
      brandId: company._id,
      brandName: company.name,
      keywords: company.keywords.map((k) => k.name),
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

    // Fetch new posts and comments
    const posts = await fetchNewPosts("all", 25);
    const comments = await fetchNewComments("all", 25);

    console.log(
      `📝 Fetched ${posts.length} posts and ${comments.length} comments`
    );

    const newMentions = [];

    // Check posts for keyword matches
    for (const post of posts) {
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

    // Check comments for keyword matches
    for (const comment of comments) {
      const content = comment.body;

      for (const brand of brands) {
        const matchedKeyword = checkKeywordMatch(content, brand.keywords);

        if (matchedKeyword) {
          const mention = {
            brandId: brand.brandId,
            keywordMatched: matchedKeyword,
            redditId: comment.id,
            redditType: "comment",
            subreddit: comment.subreddit,
            author: comment.author,
            title: undefined,
            content: comment.body,
            url: comment.url,
            permalink: comment.permalink,
            score: comment.score,
            numComments: 0,
            created: comment.created,
            sentiment: analyzeSentiment(comment.body),
            isProcessed: true,
          };

          newMentions.push(mention);
          console.log(
            `✅ Found mention: ${
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
