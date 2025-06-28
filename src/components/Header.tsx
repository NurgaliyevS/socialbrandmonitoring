
import React from 'react';
import { Search, Filter, Plus, Download, MoreVertical } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddFilter: () => void;
  onExport: () => void;
}

const Header = ({ searchQuery, onSearchChange, onAddFilter, onExport }: HeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">All mentions</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 inline" />
            Export
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
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

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">bubble</span>
          <button className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">×</button>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 ml-4">
          <input type="checkbox" className="rounded" />
          Only unread
        </label>
      </div>
    </div>
  );
};

export default Header;
