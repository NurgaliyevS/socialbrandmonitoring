import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

// GET - Fetch all companies for authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    // Only fetch companies owned by the authenticated user
    const companies = await Company.find({ user: request.user!.id })
      .select('name website keywords slackConfig emailConfig onboardingComplete');
    
    return NextResponse.json({
      success: true,
      data: companies
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

// POST - Create a new company for authenticated user
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { name, website } = await request.json();

    if (!name || !website) {
      return NextResponse.json({
        success: false,
        error: 'Name and website are required'
      }, { status: 400 });
    }

    // Check if company already exists for this user
    const existingCompany = await Company.findOne({ 
      website,
      user: request.user!.id 
    });
    
    if (existingCompany) {
      return NextResponse.json({
        success: false,
        error: 'You already have a company with this website'
      }, { status: 409 });
    }

    // Check if website is already used by another user
    const websiteExists = await Company.findOne({ website });
    if (websiteExists) {
      return NextResponse.json({
        success: false,
        error: 'This website is already registered by another user'
      }, { status: 409 });
    }

    const company = new Company({
      name,
      website,
      user: request.user!.id, // Associate with authenticated user
      keywords: [],
      slackConfig: {
        enabled: false,
        webhookUrl: '',
        channel: '#monitoring'
      },
      emailConfig: {
        enabled: false,
        recipients: request.user!.email ? [request.user!.email] : []
      },
      onboardingComplete: false
    });

    await company.save();

    return NextResponse.json({
      success: true,
      data: company
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}); 