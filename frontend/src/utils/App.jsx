// Modern Media Gallery - React Frontend Starter
// Getty Images / Shutterstock inspired design

// package.json
{
  "name": "media-gallery-ui",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.2.3",
    "react-masonry-css": "^1.0.16",
    "yet-another-react-lightbox": "^3.15.0",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}

// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#6B7280',
        accent: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

// src/config.js - API Configuration
export const API_CONFIG = {
  uploadEndpoint: import.meta.env.VITE_API_UPLOAD_URL || 'https://your-api.execute-api.us-east-1.amazonaws.com/dev/upload',
  mediaEndpoint: import.meta.env.VITE_API_MEDIA_URL || 'https://your-api.execute-api.us-east-1.amazonaws.com/dev/media',
};

// src/App.jsx - Main Application
import React, { useState, useEffect } from 'react';
import { Upload, Search, Grid, List, X, Download, Share2, Trash2 } from 'lucide-react';
import Masonry from 'react-masonry-css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { MediaService } from './services/mediaService';
import { Header } from './components/Header';
import { UploadModal } from './components/UploadModal';
import { MediaCard } from './components/MediaCard';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';

export default function App() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // 'all', 'image', 'video'
    sortBy: 'date', // 'date', 'name', 'size'
  });

  useEffect(() => {
    loadMedia();
  }, [filters]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await MediaService.listMedia(filters);
      setMedia(data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setUploadModalOpen(false);
    loadMedia();
  };

  const handleDelete = async (mediaId) => {
    if (confirm('Delete this media item?')) {
      await MediaService.deleteMedia(mediaId);
      loadMedia();
    }
  };

  const breakpointColumns = {
    default: 4,
    1536: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header onUploadClick={() => setUploadModalOpen(true)} />

      {/* Search & Filters */}
      <div className="border-b bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <SearchBar 
              value={filters.search}
              onChange={(search) => setFilters({ ...filters, search })}
            />
            
            <FilterPanel 
              filters={filters}
              onFilterChange={setFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-16">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No media yet</h3>
            <p className="mt-2 text-gray-500">Upload your first image or video to get started</p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Media
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex -ml-4 w-auto"
            columnClassName="pl-4 bg-clip-padding"
          >
            {media.map((item, index) => (
              <MediaCard
                key={item.mediaId}
                media={item}
                onView={() => setLightboxIndex(index)}
                onDelete={() => handleDelete(item.mediaId)}
              />
            ))}
          </Masonry>
        ) : (
          <div className="space-y-2">
            {media.map((item) => (
              <MediaListItem
                key={item.mediaId}
                media={item}
                onDelete={() => handleDelete(item.mediaId)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <UploadModal
          onClose={() => setUploadModalOpen(false)}
          onComplete={handleUploadComplete}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          slides={media.map(item => ({
            src: item.url,
            alt: item.filename,
            description: `${item.filename} • ${formatFileSize(item.size)} • ${formatDate(item.uploadedAt)}`,
          }))}
        />
      )}
    </div>
  );
}

// src/components/Header.jsx
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

// src/components/SearchBar.jsx
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

// src/components/MediaCard.jsx
import React, { useState } from 'react';
import { Download, Share2, Trash2, Play } from 'lucide-react';
import { formatFileSize, formatDate } from '../utils/formatters';

export function MediaCard({ media, onView, onDelete }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isVideo = media.contentType?.startsWith('video/');

  return (
    <div className="mb-4 group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative cursor-pointer" onClick={onView}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        <img
          src={media.thumbnailUrl || media.url}
          alt={media.filename}
          className={`w-full h-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play className="h-12 w-12 text-white" />
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white text-sm font-medium truncate">{media.filename}</p>
            <p className="text-gray-300 text-xs mt-1">
              {formatFileSize(media.size)} • {formatDate(media.uploadedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); /* Download logic */ }}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); /* Share logic */ }}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title="Share"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </button>
      </div>
    </div>
  );
}

// src/services/mediaService.js
import { API_CONFIG } from '../config';

export const MediaService = {
  async listMedia(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await fetch(`${API_CONFIG.mediaEndpoint}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch media');
    return response.json();
  },

  async uploadMedia(file, onProgress) {
    // Step 1: Request pre-signed URL
    const uploadRequest = await fetch(API_CONFIG.uploadEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!uploadRequest.ok) throw new Error('Failed to get upload URL');
    const { uploadUrl, mediaId } = await uploadRequest.json();

    // Step 2: Upload directly to S3
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve({ mediaId, filename: file.name });
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  },

  async deleteMedia(mediaId) {
    const response = await fetch(`${API_CONFIG.mediaEndpoint}/${mediaId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete media');
    return response.json();
  },
};
