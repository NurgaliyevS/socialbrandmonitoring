import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { website, keywords, companyName, scrapedData } = await request.json();

    // Fetch the user's plan status
    const user = await User.findById(request.user!.id);
    const userPlan = user?.plan || 'free';
    console.log('User plan status:', userPlan); // For debugging, can be removed later

    // Validate required fields
    if (!website || !companyName) {
      return NextResponse.json({
        success: false,
        error: 'Website and company name are required'
      }, { status: 400 });
    }

    // Check if user already has a company with this website
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

    const company = new Company({
      name: companyName,
      website,
      user: request.user!.id, // Associate with authenticated user
      title: scrapedData?.title,
      description: scrapedData?.description,
      keywords: keywords || [],
      scrapedData: {
        headings: scrapedData?.headings || [],
        bodyText: scrapedData?.bodyText || ''
      },
      onboardingComplete: true,
      emailConfig: {
        enabled: true,
        recipients: request.user!.email ? [request.user!.email] : []
      },
    });

    await company.save();

    // Update user's onboarding status
    await User.findByIdAndUpdate(request.user!.id, {
      onboardingComplete: true
    });

    // Restrict core logic for free users
    if (userPlan === 'free') {
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/polling-service`, { method: 'POST' });
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/comments-polling-service`, { method: 'POST' });
      return NextResponse.json({
        success: true,
        companyId: company._id,
        userPlan,
        showUpgrade: true // Frontend should show upgrade popup/modal
      });
    } else {
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/polling-service`, { method: 'POST' });
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/comments-polling-service`, { method: 'POST' });
      return NextResponse.json({
        success: true,
        companyId: company._id,
        userPlan,
        showUpgrade: false
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const website = searchParams.get('website');
    
    if (!website) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing website parameter' 
      }, { status: 400 });
    }
    
    // Only allow users to access their own companies
    const company = await Company.findOne({ 
      website,
      user: request.user!.id 
    });
    
    if (!company) {
      return NextResponse.json({ 
        success: false, 
        error: 'Company not found or you do not have access to it' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { website, keywords, companyName, scrapedData } = await request.json();
    
    if (!website) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing website parameter' 
      }, { status: 400 });
    }
    
    // Only allow users to update their own companies
    const company = await Company.findOne({ 
      website,
      user: request.user!.id 
    });
    
    if (!company) {
      return NextResponse.json({ 
        success: false, 
        error: 'Company not found or you do not have access to it' 
      }, { status: 404 });
    }
    
    // Update company fields
    company.name = companyName;
    company.title = scrapedData?.title;
    company.description = scrapedData?.description;
    company.keywords = keywords || [];
    company.scrapedData = {
      headings: scrapedData?.headings || [],
      bodyText: scrapedData?.bodyText || ''
    };
    
    await company.save();
    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const website = searchParams.get('website');
    
    if (!website) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing website parameter' 
      }, { status: 400 });
    }
    
    // Only allow users to delete their own companies
    const result = await Company.deleteOne({ 
      website,
      user: request.user!.id 
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Company not found or you do not have access to it' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}); 