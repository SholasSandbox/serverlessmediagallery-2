import React from 'react';
import { Upload, Image } from 'lucide-react';

export function Header({ onUploadClick }) {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Image className="h-8 w-8 text-primary" />
            <span className="ml-3 text-xl font-bold text-primary">Media Gallery</span>
          </div>
          <button
            onClick={onUploadClick}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload
          </button>
        </div>
      </div>
    </header>
  );
}
