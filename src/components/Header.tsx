
import React from 'react';
import { Search, Filter, Plus, Download, MoreVertical } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddFilter: () => void;
  onExport: () => void;
  activeFilters?: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  onRemoveFilter?: (key: string) => void;
}

const Header = ({ searchQuery, onSearchChange, onAddFilter, onExport, activeFilters = [], onRemoveFilter }: HeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">All mentions</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search mentions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={onAddFilter}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add filter
        </button>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2">
            {activeFilters.map((filter) => (
              <div key={filter.key} className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                <span>{filter.label}: {filter.value}</span>
                {onRemoveFilter && (
                  <button 
                    onClick={() => onRemoveFilter(filter.key)}
                    className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-gray-600 ml-4">
          <input type="checkbox" className="rounded" />
          Only unread
        </label>
      </div>
    </div>
  );
};

export default Header;
