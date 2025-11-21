import React, { useState } from 'react';
import { Download, Share2, Trash2, Play } from 'lucide-react';
import { formatFileSize, formatDate } from '../utils/formatters';

export function MediaCard({ media, onView, onDelete }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isVideo = media.contentType?.startsWith('video/');

  return (
    <div className="mb-4 group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative cursor-pointer" onClick={onView}>
        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

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

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white text-sm font-medium truncate">{media.filename}</p>
            <p className="text-gray-300 text-xs mt-1">
              {formatFileSize(media.size)} • {formatDate(media.uploadedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: implement download
          }}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: implement share
          }}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title="Share"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </button>
      </div>
    </div>
  );
}
