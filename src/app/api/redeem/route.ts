import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Code from "@/models/Code";

const MONGO_URI = process.env.MONGODB_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json();

    if (!code) return NextResponse.json({ success: false, message: "Please provide a code." });

    if (!mongoose.connections[0]?.readyState) {
      await mongoose.connect(MONGO_URI);
    }

    const codeDoc = await Code.findOne({ code });

    if (!codeDoc) {
      return NextResponse.json({ success: false, message: "Invalid code." });
    }

    if (codeDoc.redeemed) {
      return NextResponse.json({ success: false, message: "This code has already been redeemed." });
    }

    codeDoc.redeemed = true;
    codeDoc.redeemedAt = new Date();
    if (email) codeDoc.buyerEmail = email;
    await codeDoc.save();

    return NextResponse.json({ success: true, message: "✅ Code redeemed successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error. Please try again." });
  }
}
