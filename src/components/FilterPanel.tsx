import React, { useState, useEffect } from 'react';
import { MentionsFilters, FilterOptions } from '@/lib/mentions-service';

interface FilterPanelProps {
  filters: MentionsFilters;
  onFilterChange: (newFilters: Partial<MentionsFilters>) => void;
  selectedBrand: string | null;
}

const FilterPanel = ({ filters, onFilterChange, selectedBrand }: FilterPanelProps) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ subreddits: [], keywords: [] });
  const [loading, setLoading] = useState(false);

  // Fetch filter options when component mounts or when selectedBrand changes
  useEffect(() => {
    if (selectedBrand) {
      loadFilterOptions();
    }
  }, [selectedBrand]);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const { mentionsService } = await import('@/lib/mentions-service');
      const options = await mentionsService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSentimentChange = (sentiment: 'positive' | 'negative' | 'neutral' | '') => {
    onFilterChange({ sentiment: sentiment || undefined });
  };

  const handleSubredditChange = (subreddit: string) => {
    onFilterChange({ subreddit: subreddit || undefined });
  };

  const handleKeywordChange = (keyword: string) => {
    onFilterChange({ keyword: keyword || undefined });
  };

  const handlePlatformChange = (platform: 'reddit' | 'hackernews' | '') => {
    onFilterChange({ platform: platform || undefined });
  };

  const handleStartDateChange = (date: string) => {
    // Validate that start date is not after end date
    if (date && filters.endDate && date > filters.endDate) {
      alert('Start date cannot be after end date');
      return;
    }
    onFilterChange({ startDate: date || undefined });
  };

  const handleEndDateChange = (date: string) => {
    // Validate that end date is not before start date
    if (date && filters.startDate && date < filters.startDate) {
      alert('End date cannot be before start date');
      return;
    }
    onFilterChange({ endDate: date || undefined });
  };

  return (
    <div>
      <div className="text-lg font-semibold mb-6">Filters</div>
      
      {/* Sentiment Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sentiment
        </label>
        <select
          value={filters.sentiment || ''}
          onChange={(e) => handleSentimentChange(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All sentiments</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>


      {/* Platform Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platform
        </label>
        <select
          value={filters.platform || ''}
          onChange={(e) => {
            const val = e.target.value as 'reddit' | 'hackernews' | '';
            handlePlatformChange(val);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          <option value="">All platforms</option>
          {filterOptions.platforms && filterOptions.platforms.length > 0 ? (
            filterOptions.platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform === 'reddit' ? 'Reddit' : 'Hacker News'}
              </option>
            ))
          ) : (
            <>
              <option value="reddit">Reddit</option>
              <option value="hackernews">Hacker News</option>
            </>
          )}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        
        {/* Quick Date Presets */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => {
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              onFilterChange({ 
                startDate: yesterday.toISOString().split('T')[0], 
                endDate: today.toISOString().split('T')[0] 
              });
            }}
            className={`px-2 py-1 text-xs rounded border ${
              filters.startDate && filters.endDate && 
              new Date(filters.startDate).toDateString() === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString() &&
              new Date(filters.endDate).toDateString() === new Date().toDateString()
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
            }`}
          >
            Last 24h
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              onFilterChange({ 
                startDate: weekAgo.toISOString().split('T')[0], 
                endDate: today.toISOString().split('T')[0] 
              });
            }}
            className={`px-2 py-1 text-xs rounded border ${
              filters.startDate && filters.endDate && 
              new Date(filters.startDate).toDateString() === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString() &&
              new Date(filters.endDate).toDateString() === new Date().toDateString()
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
            }`}
          >
            Last 7 days
          </button>
          {/* last 14 days */}
          <button
            onClick={() => {
              const today = new Date();
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 14);
              onFilterChange({ 
                startDate: weekAgo.toISOString().split('T')[0], 
                endDate: today.toISOString().split('T')[0] 
              });
            }}
            className={`px-2 py-1 text-xs rounded border ${
              filters.startDate && filters.endDate && 
              new Date(filters.startDate).toDateString() === new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toDateString() &&
              new Date(filters.endDate).toDateString() === new Date().toDateString()
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
            }`}
          >
            Last 14 days
          </button>
          {/* last 30 days */}
          <button
            onClick={() => {
              const today = new Date();
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              onFilterChange({ 
                startDate: monthAgo.toISOString().split('T')[0], 
                endDate: today.toISOString().split('T')[0] 
              });
            }}
            className={`px-2 py-1 text-xs rounded border ${
              filters.startDate && filters.endDate && 
              new Date(filters.startDate).toDateString() === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toDateString() &&
              new Date(filters.endDate).toDateString() === new Date().toDateString()
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
            }`}
          >
            Last 30 days
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
        
        {/* Clear Date Filter Button */}
        {(filters.startDate || filters.endDate) && (
          <button
            onClick={() => onFilterChange({ startDate: undefined, endDate: undefined })}
            className="w-full mt-2 px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Date Filter
          </button>
        )}
      </div>


      {/* Keyword Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keyword
        </label>
        <select
          value={filters.keyword || ''}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          <option value="">All keywords</option>
          {loading ? (
            <option value="" disabled>Loading keywords...</option>
          ) : (
            filterOptions.keywords.map((keyword) => (
              <option key={keyword} value={keyword}>
                {keyword}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Subreddit Filter */}
      {/* Only show if platform is reddit */}
      {filters.platform === 'reddit' && (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subreddit
        </label>
        <select
          value={filters.subreddit || ''}
          onChange={(e) => handleSubredditChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          <option value="">All subreddits</option>
          {loading ? (
            <option value="" disabled>Loading subreddits...</option>
          ) : (
            filterOptions.subreddits.map((subreddit) => (
              <option key={subreddit} value={subreddit}>
                r/{subreddit}
              </option>
            ))
          )}
          </select>
        </div>
      )}

      {/* Clear Filters */}
      {(filters.sentiment || filters.subreddit || filters.keyword || filters.startDate || filters.endDate) && (
        <button
          onClick={() => onFilterChange({ 
            sentiment: undefined, 
            subreddit: undefined, 
            keyword: undefined,
            startDate: undefined,
            endDate: undefined
          })}
          className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Clear All Filters
        </button>
      )}

      {/* Brand Info */}
      {selectedBrand && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Brand</h3>
          <p className="text-sm text-blue-700">
            Viewing mentions for the selected brand. Use filters above to narrow down results.
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 