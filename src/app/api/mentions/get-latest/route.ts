import connectDB from "@/lib/mongodb";
import Mention from "@/models/Mention";
import { NextResponse } from "next/server";

// GET - Fetch unique filter options (subreddits and keywords) for the user's mentions
export const GET = async () => {
  try {
    await connectDB();
    // latest 10 mentions   
    const mentions = await Mention.find({}).sort({ created: -1 }).limit(10);
    console.log(mentions, "mentions");
    return NextResponse.json({
      success: true,
      data: mentions,
    });
  } catch (error) {
    console.error("Error fetching mentions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
