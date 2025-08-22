export interface Mention {
  id: string;
  subreddit?: string;
  author: string;
  title: string;
  content: string;
  url: string;
  score: number;
  comments: number;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  brandName: string;
  permalink: string;
  itemType: 'post' | 'comment' | 'story'; // Use itemType instead of redditType
  platform: 'reddit' | 'hackernews'; // Add platform for source distinction
  unread: boolean;
}

export interface MentionsResponse {
  mentions: Mention[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MentionsFilters {
  brandId?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  subreddit?: string;
  keyword?: string;
  page?: number;
  limit?: number;
  platform?: 'reddit' | 'hackernews'; // Add platform filter
  unread?: boolean;
}

export interface FilterOptions {
  subreddits: string[];
  keywords: string[];
  platforms?: string[]; // Add platforms array for filter options
}

class MentionsService {
  private baseUrl = '/api/mentions';

  async getMentions(filters: MentionsFilters = {}): Promise<MentionsResponse> {
    const params = new URLSearchParams();
    
    if (filters.brandId) params.append('brandId', filters.brandId);
    if (filters.sentiment) params.append('sentiment', filters.sentiment);
    if (filters.subreddit) params.append('subreddit', filters.subreddit);
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.unread) params.append('unread', filters.unread.toString());

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch mentions');
    }

    const data = await response.json();
    return data.data;
  }

  async getMentionsByBrand(brandId: string, filters: Omit<MentionsFilters, 'brandId'> = {}): Promise<MentionsResponse> {
    console.log(filters, "filters");
    return this.getMentions({ ...filters, brandId });
  }

  async getFilterOptions(): Promise<FilterOptions> {
    const response = await fetch(`${this.baseUrl}/filter-options`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch filter options');
    }

    const data = await response.json();
    return data.data;
  }

  async markAsRead(mentionIds: string[]): Promise<{ updatedCount: number }> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mentionIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark mentions as read');
    }

    const data = await response.json();
    return data.data;
  }

  async markAsUnread(mentionIds: string[]): Promise<{ updatedCount: number }> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mentionIds, action: 'markAsUnread' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark mentions as unread');
    }

    const data = await response.json();
    return data.data;
  }
}

export const mentionsService = new MentionsService(); 