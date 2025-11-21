// frontend/src/utils/validation.js
// Validation utilities for the Media Gallery

/**
 * Allowed file types for upload
 */
export const ALLOWED_FILE_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
  ],
  videos: [
    'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/webm',
    'video/x-matroska', // .mkv
  ],
};

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  image: 50 * 1024 * 1024,  // 50MB
  video: 200 * 1024 * 1024, // 200MB
};

/**
 * Check if file type is allowed
 * @param {string} contentType - MIME type
 * @returns {boolean} True if allowed
 */
export function isAllowedFileType(contentType) {
  const allAllowedTypes = [
    ...ALLOWED_FILE_TYPES.images,
    ...ALLOWED_FILE_TYPES.videos,
  ];
  return allAllowedTypes.includes(contentType);
}

/**
 * Get maximum file size for a given content type
 * @param {string} contentType - MIME type
 * @returns {number} Max size in bytes
 */
export function getMaxFileSize(contentType) {
  if (contentType?.startsWith('image/')) {
    return MAX_FILE_SIZES.image;
  }
  if (contentType?.startsWith('video/')) {
    return MAX_FILE_SIZES.video;
  }
  return MAX_FILE_SIZES.image; // Default
}

/**
 * Validate a file for upload
 * @param {File} file - File object to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  if (!isAllowedFileType(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Please upload an image or video.`,
    };
  }

  // Check file size
  const maxSize = getMaxFileSize(file.type);
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    const fileSizeMB = Math.round(file.size / 1024 / 1024);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB).`,
    };
  }

  // Check filename
  if (!file.name || file.name.length === 0) {
    return { valid: false, error: 'File has no name' };
  }

  return { valid: true, error: null };
}

/**
 * Validate multiple files
 * @param {FileList|File[]} files - Files to validate
 * @returns {Object} { valid: boolean, errors: string[], validFiles: File[] }
 */
export function validateFiles(files) {
  const fileArray = Array.from(files);
  const errors = [];
  const validFiles = [];

  fileArray.forEach((file, index) => {
    const result = validateFile(file);
    if (result.valid) {
      validFiles.push(file);
    } else {
      errors.push(`File ${index + 1} (${file.name}): ${result.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
  };
}

/**
 * Sanitize filename to remove special characters
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'untitled';

  // Get extension
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename;
  const ext = lastDotIndex > 0 ? filename.slice(lastDotIndex) : '';

  // Remove special characters, keep alphanumeric, spaces, hyphens, underscores
  const sanitizedName = name
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-')  // Replace multiple hyphens with single
    .trim()
    .toLowerCase();

  return sanitizedName + ext.toLowerCase();
}

/**
 * Validate search query
 * @param {string} query - Search query string
 * @returns {Object} { valid: boolean, sanitized: string, error: string|null }
 */
export function validateSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return { valid: false, sanitized: '', error: 'Invalid search query' };
  }

  // Trim whitespace
  const trimmed = query.trim();

  // Check length
  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', error: 'Search query is empty' };
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      sanitized: trimmed.slice(0, 100),
      error: 'Search query too long (max 100 characters)',
    };
  }

  // Sanitize (remove potentially harmful characters)
  const sanitized = trimmed.replace(/[<>]/g, '');

  return { valid: true, sanitized, error: null };
}

/**
 * Check if a URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email address (basic)
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid format
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if file extension matches content type
 * @param {string} filename - Filename with extension
 * @param {string} contentType - MIME type
 * @returns {boolean} True if matching
 */
export function extensionMatchesContentType(filename, contentType) {
  if (!filename || !contentType) return false;

  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return false;

  const extensionToType = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    // Videos
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
  };

  return extensionToType[extension] === contentType;
}

/**
 * Get human-readable error message for file upload errors
 * @param {Error|string} error - Error object or message
 * @returns {string} User-friendly error message
 */
export function getUploadErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  const message = typeof error === 'string' ? error : error.message;

  // Common error patterns
  if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (message.includes('timeout')) {
    return 'Upload timed out. Please try again with a smaller file.';
  }

  if (message.includes('401') || message.includes('unauthorized')) {
    return 'Authentication failed. Please log in and try again.';
  }

  if (message.includes('403') || message.includes('forbidden')) {
    return 'You do not have permission to upload files.';
  }

  if (message.includes('413') || message.includes('too large')) {
    return 'File is too large. Please choose a smaller file.';
  }

  if (message.includes('415') || message.includes('unsupported')) {
    return 'File type is not supported. Please upload an image or video.';
  }

  if (message.includes('500') || message.includes('server error')) {
    return 'Server error. Please try again later.';
  }

  // Return original message if no pattern matches
  return message;
}

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} { valid: boolean, page: number, limit: number }
 */
export function validatePagination(page, limit) {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

  return {
    valid: true,
    page: validPage,
    limit: validLimit,
  };
}

/**
 * Validate sort parameters
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Object} { valid: boolean, sortBy: string, sortOrder: string }
 */
export function validateSort(sortBy, sortOrder) {
  const validSortFields = ['date', 'name', 'size', 'type'];
  const validSortOrders = ['asc', 'desc'];

  const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'date';
  const validatedSortOrder = validSortOrders.includes(sortOrder?.toLowerCase())
    ? sortOrder.toLowerCase()
    : 'desc';

  return {
    valid: true,
    sortBy: validatedSortBy,
    sortOrder: validatedSortOrder,
  };
}

/**
 * Validate filter parameters
 * @param {Object} filters - Filter object
 * @returns {Object} Validated filters
 */
export function validateFilters(filters = {}) {
  const validTypes = ['all', 'image', 'video'];
  
  return {
    search: filters.search ? String(filters.search).trim() : '',
    type: validTypes.includes(filters.type) ? filters.type : 'all',
    sortBy: validateSort(filters.sortBy, filters.sortOrder).sortBy,
    sortOrder: validateSort(filters.sortBy, filters.sortOrder).sortOrder,
  };
}

/**
 * Check if browser supports required features
 * @returns {Object} { supported: boolean, missing: string[] }
 */
export function checkBrowserSupport() {
  const missing = [];

  if (!window.File || !window.FileReader || !window.FileList) {
    missing.push('File API');
  }

  if (!window.fetch) {
    missing.push('Fetch API');
  }

  if (!window.Promise) {
    missing.push('Promises');
  }

  if (!window.URLSearchParams) {
    missing.push('URLSearchParams');
  }

  return {
    supported: missing.length === 0,
    missing,
  };
}
