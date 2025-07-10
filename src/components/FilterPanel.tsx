import React from 'react';
import { MentionsFilters } from '@/lib/mentions-service';

interface FilterPanelProps {
  filters: MentionsFilters;
  onFilterChange: (newFilters: Partial<MentionsFilters>) => void;
  selectedBrand: string | null;
}

const FilterPanel = ({ filters, onFilterChange, selectedBrand }: FilterPanelProps) => {
  const handleSentimentChange = (sentiment: 'positive' | 'negative' | 'neutral' | '') => {
    onFilterChange({ sentiment: sentiment || undefined });
  };

  const handleSubredditChange = (subreddit: string) => {
    onFilterChange({ subreddit: subreddit || undefined });
  };

  const handleKeywordChange = (keyword: string) => {
    onFilterChange({ keyword: keyword || undefined });
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

      {/* Subreddit Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subreddit
        </label>
        <input
          type="text"
          placeholder="Filter by subreddit..."
          value={filters.subreddit || ''}
          onChange={(e) => handleSubredditChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Keyword Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keyword
        </label>
        <input
          type="text"
          placeholder="Filter by keyword..."
          value={filters.keyword || ''}
          onChange={(e) => handleKeywordChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Clear Filters */}
      {(filters.sentiment || filters.subreddit || filters.keyword) && (
        <button
          onClick={() => onFilterChange({ sentiment: undefined, subreddit: undefined, keyword: undefined })}
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