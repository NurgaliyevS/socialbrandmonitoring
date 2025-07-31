import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Code from "@/models/Code";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/welcome-email";

const MONGO_URI = process.env.MONGODB_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json();

    if (!code) return NextResponse.json({ success: false, message: "Please provide a code." });
    if (!email) return NextResponse.json({ success: false, message: "Please provide your email address." });

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

    // Mark code as redeemed
    codeDoc.redeemed = true;
    codeDoc.redeemedAt = new Date();
    if (email) codeDoc.buyerEmail = email;
    await codeDoc.save();

    // Auto-create or update user account with lifetime access
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user with lifetime access
      user.plan = 'lifetime';
      user.onboardingComplete = true;
      await user.save();
    } else {
      // Create new user with lifetime access
      user = await User.create({
        name: email.split('@')[0], // Use email prefix as name
        email: email,
        plan: 'lifetime',
        onboardingComplete: true
      });
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(email, code);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the redemption if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: "✅ Code redeemed successfully! You now have lifetime access.",
      redirectTo: "/dashboard"
    });
  } catch (error) {
    console.error('Redeem error:', error);
    return NextResponse.json({ success: false, message: "Server error. Please try again." });
  }
}
