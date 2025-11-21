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

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
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
