// frontend/src/utils/formatters.js
// Utility functions for formatting data in the Media Gallery

/**
 * Format file size from bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format date to relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Relative time string
 */
export function formatDate(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}

/**
 * Format date to absolute format (e.g., "Jan 15, 2024 at 3:45 PM")
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted date string
 */
export function formatAbsoluteDate(date) {
  const d = new Date(date);
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return d.toLocaleDateString('en-US', options);
}

/**
 * Format duration in seconds to readable format (e.g., "2:35" or "1:05:30")
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get file extension from filename
 * @param {string} filename - Full filename
 * @returns {string} File extension (lowercase, without dot)
 */
export function getFileExtension(filename) {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Check if file is an image based on content type
 * @param {string} contentType - MIME type
 * @returns {boolean} True if image
 */
export function isImage(contentType) {
  return contentType?.startsWith('image/') || false;
}

/**
 * Check if file is a video based on content type
 * @param {string} contentType - MIME type
 * @returns {boolean} True if video
 */
export function isVideo(contentType) {
  return contentType?.startsWith('video/') || false;
}

/**
 * Get media type label
 * @param {string} contentType - MIME type
 * @returns {string} "Image" or "Video"
 */
export function getMediaTypeLabel(contentType) {
  if (isImage(contentType)) return 'Image';
  if (isVideo(contentType)) return 'Video';
  return 'File';
}

/**
 * Truncate filename to specified length
 * @param {string} filename - Full filename
 * @param {number} maxLength - Maximum length (default: 30)
 * @returns {string} Truncated filename with extension preserved
 */
export function truncateFilename(filename, maxLength = 30) {
  if (!filename || filename.length <= maxLength) return filename;

  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.slice(0, filename.length - extension.length - 1);
  const truncateLength = maxLength - extension.length - 4; // -4 for "..." and "."

  return `${nameWithoutExt.slice(0, truncateLength)}...${extension}`;
}

/**
 * Generate a placeholder color based on filename
 * @param {string} filename - Filename
 * @returns {string} Hex color code
 */
export function getPlaceholderColor(filename) {
  if (!filename) return '#9CA3AF'; // Default gray

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to color
  const colors = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // green
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
  ];

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1,234,567")
 */
export function formatNumber(num) {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate aspect ratio class for Tailwind
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Tailwind aspect ratio class
 */
export function getAspectRatioClass(width, height) {
  if (!width || !height) return 'aspect-video';

  const ratio = width / height;

  if (ratio > 1.7) return 'aspect-video'; // 16:9
  if (ratio > 1.4) return 'aspect-video'; // ~3:2
  if (ratio > 0.9 && ratio < 1.1) return 'aspect-square'; // 1:1
  if (ratio < 0.7) return 'aspect-[3/4]'; // Portrait

  return 'aspect-video'; // Default
}

/**
 * Validate file type
 * @param {File} file - File object
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if valid
 */
export function isValidFileType(file, allowedTypes) {
  if (!file || !allowedTypes) return false;
  
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      // Wildcard check (e.g., "image/*")
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
}

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSizeInMB - Maximum size in megabytes
 * @returns {boolean} True if valid
 */
export function isValidFileSize(file, maxSizeInMB) {
  if (!file) return false;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Get file validation error message
 * @param {File} file - File object
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export function getFileValidationError(file, options = {}) {
  const {
    maxSizeInMB = 100,
    allowedTypes = ['image/*', 'video/*']
  } = options;

  if (!file) {
    return 'No file selected';
  }

  if (!isValidFileType(file, allowedTypes)) {
    return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
  }

  if (!isValidFileSize(file, maxSizeInMB)) {
    return `File too large. Maximum size: ${maxSizeInMB}MB`;
  }

  return null;
}
