import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Email from '@/models/Email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, source = 'modal' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await Email.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new email record
    const newEmail = new Email({
      email: email.toLowerCase(),
      source,
      timestamp: new Date()
    });

    await newEmail.save();

    return NextResponse.json(
      { 
        message: 'Email saved successfully',
        email: newEmail.toJSON()
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving email:', error);
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const emails = await Email.find({})
      .sort({ timestamp: -1 })
      .limit(100);

    return NextResponse.json(
      { emails: emails.map(email => email.toJSON()) },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
} 