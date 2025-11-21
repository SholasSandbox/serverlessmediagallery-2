import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import Masonry from 'react-masonry-css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

import { MediaService } from './services/mediaService';
import { Header } from './components/Header';
import { UploadModal } from './components/UploadModal';
import { MediaCard } from './components/MediaCard';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { MediaListItem } from './components/MediaListItem';
import { formatDate, formatFileSize } from './utils/formatters';

export default function App() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    sortBy: 'date',
  });

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (window.confirm('Delete this media item?')) {
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
      <Header onUploadClick={() => setUploadModalOpen(true)} />

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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

      {uploadModalOpen && (
        <UploadModal
          onClose={() => setUploadModalOpen(false)}
          onComplete={handleUploadComplete}
        />
      )}

      {lightboxIndex >= 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          slides={media.map((item) => ({
            src: item.url,
            alt: item.filename,
            description: `${item.filename} • ${formatFileSize(item.size)} • ${formatDate(item.uploadedAt)}`,
          }))}
        />
      )}
    </div>
  );
}
