import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1 max-w-2xl">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search your media..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}
