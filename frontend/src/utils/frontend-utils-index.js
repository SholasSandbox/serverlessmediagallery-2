// frontend/src/utils/index.js
// Central export file for all utility functions

// Export all formatting functions
export {
  formatFileSize,
  formatDate,
  formatAbsoluteDate,
  formatDuration,
  getFileExtension,
  isImage,
  isVideo,
  getMediaTypeLabel,
  truncateFilename,
  getPlaceholderColor,
  formatNumber,
  getAspectRatioClass,
  isValidFileType,
  isValidFileSize,
  getFileValidationError,
} from './formatters';

// Export all validation functions
export {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
  isAllowedFileType,
  getMaxFileSize,
  validateFile,
  validateFiles,
  sanitizeFilename,
  validateSearchQuery,
  isValidUrl,
  isValidEmail,
  extensionMatchesContentType,
  getUploadErrorMessage,
  validatePagination,
  validateSort,
  validateFilters,
  checkBrowserSupport,
} from './validation';

// Export all helper functions
export {
  debounce,
  throttle,
  deepClone,
  generateId,
  sleep,
  retryWithBackoff,
  copyToClipboard,
  downloadFile,
  getUrlParams,
  updateUrlParams,
  isMobile,
  isTouchDevice,
  getScreenSize,
  storage,
  groupBy,
  sortBy,
  unique,
  chunk,
  clamp,
  randomString,
  waitForElement,
  isInViewport,
  scrollToElement,
  formatError,
  isEmpty,
} from './helpers';
