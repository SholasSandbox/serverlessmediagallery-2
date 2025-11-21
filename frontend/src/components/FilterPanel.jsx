import React from 'react';
import { Grid, List } from 'lucide-react';

export function FilterPanel({ filters, onFilterChange, viewMode, onViewModeChange }) {
  return (
    <div className="flex items-center gap-3 w-full md:w-auto">
      <select
        value={filters.type}
        onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="all">All types</option>
        <option value="image">Images</option>
        <option value="video">Videos</option>
      </select>

      <select
        value={filters.sortBy}
        onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="date">Newest</option>
        <option value="name">Name</option>
        <option value="size">Size</option>
      </select>

      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
          title="Grid view"
        >
          <Grid className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`px-3 py-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
          title="List view"
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
