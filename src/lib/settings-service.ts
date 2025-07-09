import { Brand, Keyword, NotificationSettings } from '@/components/settings/types';

// Convert backend Company model to frontend Brand interface
const mapCompanyToBrand = (company: any): Brand => ({
  id: company._id,
  name: company.name,
  website: company.website,
  keywords: company.keywords || [],
  notifications: {
    email: company.emailConfig?.enabled || false,
    slack: company.slackConfig?.enabled || false,
    emailAddress: company.emailConfig?.recipients?.[0] || '',
    slackWebhook: company.slackConfig?.webhookUrl || ''
  }
});

// Convert frontend Brand interface to backend Company model
const mapBrandToCompany = (brand: Brand) => ({
  name: brand.name,
  website: brand.website,
  keywords: brand.keywords,
  emailConfig: {
    enabled: brand.notifications.email,
    recipients: brand.notifications.emailAddress ? [brand.notifications.emailAddress] : []
  },
  slackConfig: {
    enabled: brand.notifications.slack,
    webhookUrl: brand.notifications.slackWebhook || '',
    channel: '#monitoring'
  }
});

export const settingsService = {
  // Fetch all companies/brands
  async getBrands(): Promise<Brand[]> {
    try {
      const response = await fetch('/api/settings');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch brands');
      }
      
      return result.data.map(mapCompanyToBrand);
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  // Create a new brand
  async createBrand(name: string, website: string): Promise<Brand> {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, website }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create brand');
      }
      
      return mapCompanyToBrand(result.data);
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  },

  // Update a brand
  async updateBrand(brand: Brand): Promise<Brand> {
    try {
      const response = await fetch(`/api/settings/${brand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapBrandToCompany(brand)),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update brand');
      }
      
      return mapCompanyToBrand(result.data);
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  },

  // Delete a brand
  async deleteBrand(brandId: string): Promise<void> {
    try {
      const response = await fetch(`/api/settings/${brandId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  },

  // Update keywords for a brand
  async updateKeywords(brandId: string, keywords: Keyword[]): Promise<Brand> {
    try {
      const response = await fetch(`/api/settings/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update keywords');
      }
      
      return mapCompanyToBrand(result.data);
    } catch (error) {
      console.error('Error updating keywords:', error);
      throw error;
    }
  },

  // Update notification settings for a brand
  async updateNotifications(brandId: string, notifications: NotificationSettings): Promise<Brand> {
    try {
      const emailConfig = {
        enabled: notifications.email,
        recipients: notifications.emailAddress ? [notifications.emailAddress] : []
      };
      
      const slackConfig = {
        enabled: notifications.slack,
        webhookUrl: notifications.slackWebhook || '',
        channel: '#monitoring'
      };

      const response = await fetch(`/api/settings/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailConfig, slackConfig }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update notifications');
      }
      
      return mapCompanyToBrand(result.data);
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  }
}; 