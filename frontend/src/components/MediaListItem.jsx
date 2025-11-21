import React from 'react';
import { Trash2, Download, Share2, Play } from 'lucide-react';
import { formatFileSize, formatDate } from '../utils/formatters';

export function MediaListItem({ media, onDelete }) {
  const isVideo = media.contentType?.startsWith('video/');

  return (
    <div className="flex items-center gap-4 bg-white rounded-lg border p-3">
      <div className="relative h-16 w-24 overflow-hidden rounded">
        <img
          src={media.thumbnailUrl || media.url}
          alt={media.filename}
          className="h-full w-full object-cover"
        />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Play className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{media.filename}</p>
        <p className="text-xs text-gray-500">
          {formatFileSize(media.size)} • {formatDate(media.uploadedAt)}
        </p>
      </div>
      <div className="flex gap-2">
        <button className="p-2 rounded bg-gray-100" title="Download">
          <Download className="h-4 w-4" />
        </button>
        <button className="p-2 rounded bg-gray-100" title="Share">
          <Share2 className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded bg-red-50 text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
