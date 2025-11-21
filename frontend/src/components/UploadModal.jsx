import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { MediaService } from '../services/mediaService';
import { formatFileSize } from '../utils/formatters';

export function UploadModal({ onClose, onComplete }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFileChange = (event) => {
    setError('');
    setProgress(0);
    const selected = event.target.files?.[0];
    setFile(selected || null);
  };

  const onUpload = async () => {
    if (!file) {
      setError('Choose a file first');
      return;
    }
    setLoading(true);
    try {
      await MediaService.uploadMedia(file, setProgress);
      onComplete?.();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close upload modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Upload className="h-6 w-6" />
          <div>
            <h3 className="text-lg font-semibold">Upload media</h3>
            <p className="text-sm text-gray-500">Images or videos supported</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input type="file" onChange={onFileChange} className="w-full" />
          {file && (
            <p className="mt-2 text-sm text-gray-700">
              {file.name} ({formatFileSize(file.size)})
            </p>
          )}
        </div>

        {progress > 0 && (
          <div className="mt-4">
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div
                className="h-2 bg-black rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
