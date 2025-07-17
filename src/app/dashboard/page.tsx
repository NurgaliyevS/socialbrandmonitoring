"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MentionCard from '@/components/MentionCard';
import FilterPanel from '@/components/FilterPanel';
import { mentionsService, type Mention, type MentionsFilters } from '@/lib/mentions-service';
import { settingsService } from '@/lib/settings-service';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [filters, setFilters] = useState<MentionsFilters>({
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  // Load brands on component mount
  useEffect(() => {
    loadBrands();
  }, []);

  // Load mentions when filters or selected brand changes
  useEffect(() => {
    loadMentions();
  }, [filters, selectedBrand]);

  const loadBrands = async () => {
    try {
      const fetchedBrands = await settingsService.getBrands();
      setBrands(fetchedBrands);
      
      // Auto-select first brand if available
      if (fetchedBrands.length > 0 && !selectedBrand) {
        setSelectedBrand(fetchedBrands[0].id);
      }
    } catch (err) {
      console.error('Error loading brands:', err);
    }
  };

  const loadMentions = async () => {
    if (!selectedBrand) {
      setMentions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await mentionsService.getMentionsByBrand(selectedBrand, filters);
      setMentions(response.mentions);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentions');
      toast.error(err instanceof Error ? err.message : 'Failed to load mentions');
      console.error('Error loading mentions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentions = mentions.filter(mention =>
    mention.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mention.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mention.subreddit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mention.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    console.log('Export clicked');
  };



  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setFilters(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleFilterChange = (newFilters: Partial<MentionsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to first page
  };

  const handleRemoveFilter = (filterKey: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey as keyof MentionsFilters];
      return { ...newFilters, page: 1 };
    });
  };

  const handleMentionRead = (mentionId: string) => {
    setMentions(prev => 
      prev.map(mention => 
        mention.id === mentionId 
          ? { ...mention, unread: false }
          : mention
      )
    );
  };

  const handleMentionUnread = (mentionId: string) => {
    setMentions(prev => 
      prev.map(mention => 
        mention.id === mentionId 
          ? { ...mention, unread: true }
          : mention
      )
    );
  };

  // Convert filters to active filter chips
  const activeFilters = [
    filters.sentiment && { key: 'sentiment', label: 'Sentiment', value: filters.sentiment },
    filters.subreddit && { key: 'subreddit', label: 'Subreddit', value: filters.subreddit },
    filters.keyword && { key: 'keyword', label: 'Keyword', value: filters.keyword }
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  return (
    <>
      {/* Main content area */}
      <div className="flex-1 flex w-full md:pr-[400px]">
        {/* MentionCard list (center, grid layout) */}
        <div className="flex-1 p-6">
          {/* Mobile filter button */}
          <div className="md:hidden mb-4 flex items-center justify-end">
            <button
              className="p-2"
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              <span className="ml-2">Filters</span>
            </button>
          </div>
          {/* Brand selector */}
          <div className="mb-6">
            <label htmlFor="brand-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Brand
            </label>
            <select
              id="brand-select"
              value={selectedBrand || ''}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a brand...</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onExport={handleExport}
            activeFilters={activeFilters}
            onRemoveFilter={handleRemoveFilter}
          />

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading mentions...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-6 w-full">
              {filteredMentions.map((mention) => (
                <div key={mention.id} className="w-full">
                  <MentionCard mention={mention} onMentionRead={handleMentionRead} onMentionUnread={handleMentionUnread} />
                </div>
              ))}
              {filteredMentions.length === 0 && !loading && (
                <div className="col-span-1 text-center py-12">
                  <p className="text-gray-500">
                    {selectedBrand 
                      ? 'No mentions found for this brand.' 
                      : 'Please select a brand to view mentions.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
          {/* Pagination controls */}
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
              disabled={filters.page === 1}
            >
              Previous
            </button>
            <span>Page {filters.page} of {totalPages}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, (f.page ?? 1) + 1) }))}
              disabled={filters.page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Filter panel (right, fixed width) - hidden on mobile, fixed on desktop */}
      <div className="w-[400px] border-l border-gray-200 bg-gray-50 p-8 hidden md:block fixed top-0 right-0 h-screen overflow-y-auto z-40">
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          selectedBrand={selectedBrand}
        />
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 bg-white border-l border-gray-200 h-full p-6">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              selectedBrand={selectedBrand}
            />
          </div>
          <div
            className="flex-1 bg-black bg-opacity-30"
            onClick={() => setFilterOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default Dashboard;
