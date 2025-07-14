import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import { AuthenticatedRequest } from './auth-middleware';

// Get all companies owned by a user
export async function getUserCompanies(userId: string) {
  await connectDB();
  return await Company.find({ user: userId });
}

// Get a specific company owned by a user
export async function getUserCompany(userId: string, companyId: string) {
  await connectDB();
  return await Company.findOne({ _id: companyId, user: userId });
}

// Check if user has access to a company
export async function userHasCompanyAccess(userId: string, companyId: string): Promise<boolean> {
  const company = await getUserCompany(userId, companyId);
  return !!company;
}

// Get user's company IDs for filtering mentions
export async function getUserCompanyIds(userId: string): Promise<string[]> {
  const companies = await getUserCompanies(userId);
  return companies.map((company: any) => company._id.toString());
}

// Validate that the authenticated user has access to the requested resource
export async function validateUserAccess(request: AuthenticatedRequest, companyId?: string): Promise<boolean> {
  if (!request.user) {
    return false;
  }

  if (companyId) {
    return await userHasCompanyAccess(request.user.id, companyId);
  }

  return true; // User is authenticated
} 