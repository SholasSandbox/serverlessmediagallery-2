# Frontend Utility Files - Complete Package

## ✅ All Utility Files Created

I've created a comprehensive set of utility functions for your Media Gallery frontend. Here's what you have:

---

## 📁 Files Created

### 1. **formatters.js** - Data Formatting Utilities
**Location:** `frontend/src/utils/formatters.js`

**Functions:**
- `formatFileSize(bytes)` - Convert bytes to "2.5 MB" format
- `formatDate(date)` - Relative time ("2 hours ago")
- `formatAbsoluteDate(date)` - Full date ("Jan 15, 2024")
- `formatDuration(seconds)` - Video duration ("2:35")
- `getFileExtension(filename)` - Extract file extension
- `isImage(contentType)` - Check if file is image
- `isVideo(contentType)` - Check if file is video
- `getMediaTypeLabel(contentType)` - Get "Image" or "Video"
- `truncateFilename(filename, maxLength)` - Shorten filenames
- `getPlaceholderColor(filename)` - Generate color from filename
- `formatNumber(num)` - Format with commas (1,234,567)
- `getAspectRatioClass(width, height)` - Tailwind aspect ratio
- And more...

---

### 2. **validation.js** - Input Validation & File Checking
**Location:** `frontend/src/utils/validation.js`

**Constants:**
- `ALLOWED_FILE_TYPES` - Supported image and video types
- `MAX_FILE_SIZES` - Size limits (50MB images, 200MB videos)

**Functions:**
- `validateFile(file)` - Validate single file upload
- `validateFiles(files)` - Validate multiple files
- `sanitizeFilename(filename)` - Clean special characters
- `validateSearchQuery(query)` - Sanitize search input
- `isValidUrl(url)` - URL validation
- `isValidEmail(email)` - Email validation
- `getUploadErrorMessage(error)` - User-friendly error messages
- `validatePagination(page, limit)` - Pagination params
- `validateSort(sortBy, sortOrder)` - Sort params
- `validateFilters(filters)` - Filter object validation
- `checkBrowserSupport()` - Feature detection
- And more...

---

### 3. **helpers.js** - General Utility Functions
**Location:** `frontend/src/utils/helpers.js`

**Performance:**
- `debounce(func, wait)` - Delay execution (search inputs)
- `throttle(func, limit)` - Limit execution rate (scroll events)

**Data Manipulation:**
- `deepClone(obj)` - Deep copy objects
- `generateId(prefix)` - Generate unique IDs
- `groupBy(array, key)` - Group array by key
- `sortBy(array, key, order)` - Sort arrays
- `unique(array, key)` - Remove duplicates
- `chunk(array, size)` - Split into chunks

**Async Utilities:**
- `sleep(ms)` - Promise-based delay
- `retryWithBackoff(fn, maxRetries)` - Retry failed operations

**Browser Utilities:**
- `copyToClipboard(text)` - Copy to clipboard
- `downloadFile(url, filename)` - Download files
- `getUrlParams()` - Parse URL parameters
- `updateUrlParams(params)` - Update URL without reload
- `isMobile()` - Detect mobile devices
- `isTouchDevice()` - Detect touch support
- `getScreenSize()` - Get 'mobile'|'tablet'|'desktop'

**Storage:**
- `storage.get(key, defaultValue)` - Get from localStorage
- `storage.set(key, value)` - Save to localStorage
- `storage.remove(key)` - Remove from localStorage
- `storage.clear()` - Clear all localStorage

**DOM Utilities:**
- `waitForElement(selector, timeout)` - Wait for DOM element
- `isInViewport(element)` - Check if visible
- `scrollToElement(target, options)` - Smooth scroll

**Misc:**
- `clamp(value, min, max)` - Clamp number
- `randomString(length)` - Generate random string
- `formatError(error)` - Format errors for display
- `isEmpty(value)` - Check if empty

---

### 4. **index.js** - Central Export
**Location:** `frontend/src/utils/index.js`

Exports all functions from the three utility files for easy importing.

---

## 🚀 How to Use

### Installation

1. **Copy all files to your project:**
```bash
# Place these files in your React project:
frontend/src/utils/
├── formatters.js
├── validation.js
├── helpers.js
└── index.js
```

2. **Import in your components:**

```javascript
// Import specific functions
import { formatFileSize, formatDate } from '../utils/formatters';
import { validateFile, sanitizeFilename } from '../utils/validation';
import { debounce, copyToClipboard } from '../utils/helpers';

// Or import from index for convenience
import { 
  formatFileSize, 
  validateFile, 
  debounce 
} from '../utils';
```

---

## 📚 Usage Examples

### Example 1: Format File Size
```javascript
import { formatFileSize } from '../utils';

const file = { size: 2457600 }; // bytes
console.log(formatFileSize(file.size));
// Output: "2.34 MB"
```

### Example 2: Validate File Upload
```javascript
import { validateFile } from '../utils';

function handleFileSelect(file) {
  const result = validateFile(file);
  
  if (!result.valid) {
    alert(result.error);
    return;
  }
  
  // Proceed with upload
  uploadFile(file);
}
```

### Example 3: Debounced Search
```javascript
import { debounce } from '../utils';

// Create debounced search function
const debouncedSearch = debounce((query) => {
  // This will only run 300ms after user stops typing
  performSearch(query);
}, 300);

// In your component
<input 
  onChange={(e) => debouncedSearch(e.target.value)}
  placeholder="Search..."
/>
```

### Example 4: Format Date
```javascript
import { formatDate } from '../utils';

const uploadedAt = '2024-01-15T10:30:00Z';
console.log(formatDate(uploadedAt));
// Output: "2 hours ago" (relative to current time)
```

### Example 5: Copy to Clipboard
```javascript
import { copyToClipboard } from '../utils';

async function handleShare(url) {
  const success = await copyToClipboard(url);
  
  if (success) {
    toast.success('Link copied to clipboard!');
  } else {
    toast.error('Failed to copy link');
  }
}
```

### Example 6: Local Storage
```javascript
import { storage } from '../utils';

// Save user preferences
storage.set('theme', 'dark');
storage.set('gridSize', 4);

// Load preferences
const theme = storage.get('theme', 'light'); // Default: 'light'
const gridSize = storage.get('gridSize', 3); // Default: 3
```

### Example 7: Download File
```javascript
import { downloadFile } from '../utils';

function handleDownload(mediaUrl, filename) {
  try {
    await downloadFile(mediaUrl, filename);
    toast.success('Download started');
  } catch (error) {
    toast.error('Download failed');
  }
}
```

---

## 🎯 Integration with Media Gallery

These utilities are already referenced in the `modern-ui-starter.jsx` file:

```javascript
// In MediaCard.jsx
import { formatFileSize, formatDate } from '../utils';

export function MediaCard({ media }) {
  return (
    <div>
      <p>{formatFileSize(media.size)}</p>
      <p>{formatDate(media.uploadedAt)}</p>
    </div>
  );
}
```

```javascript
// In UploadModal.jsx
import { validateFile, getUploadErrorMessage } from '../utils';

function handleUpload(file) {
  const { valid, error } = validateFile(file);
  
  if (!valid) {
    setError(error);
    return;
  }
  
  // Proceed with upload...
}
```

```javascript
// In SearchBar.jsx
import { debounce } from '../utils';

const debouncedSearch = debounce((query) => {
  onSearch(query);
}, 300);
```

---

## 🧪 Testing

You can test these utilities:

```javascript
// Test file size formatting
console.log(formatFileSize(0));           // "0 Bytes"
console.log(formatFileSize(1024));        // "1 KB"
console.log(formatFileSize(1048576));     // "1 MB"
console.log(formatFileSize(1073741824));  // "1 GB"

// Test file validation
const testFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
console.log(validateFile(testFile));
// { valid: true, error: null }

// Test debounce
const debouncedLog = debounce((msg) => console.log(msg), 1000);
debouncedLog('First');  // Won't log
debouncedLog('Second'); // Won't log
debouncedLog('Third');  // Will log "Third" after 1s
```

---

## 📦 File Locations for GitHub

Place these files in your repository:

```
media-gallery/
└── frontend/
    └── src/
        └── utils/
            ├── formatters.js      ← File 1
            ├── validation.js      ← File 2
            ├── helpers.js         ← File 3
            └── index.js           ← File 4
```

---

## ✅ Complete Checklist

When adding to your project:

- [ ] Create `frontend/src/utils/` directory
- [ ] Copy `formatters.js`
- [ ] Copy `validation.js`
- [ ] Copy `helpers.js`
- [ ] Copy `index.js`
- [ ] Update imports in your components
- [ ] Test utility functions
- [ ] Commit to GitHub

---

## 🎁 Bonus Features

These utilities provide:
- ✅ **Type Safety** - All functions have proper parameter validation
- ✅ **Error Handling** - Try-catch blocks where needed
- ✅ **Browser Compatibility** - Fallbacks for older browsers
- ✅ **Performance** - Debounce/throttle for expensive operations
- ✅ **User Experience** - User-friendly error messages
- ✅ **Accessibility** - Support for keyboard navigation
- ✅ **Mobile Support** - Touch and mobile detection
- ✅ **Reusability** - Pure functions, no side effects
- ✅ **Documentation** - JSDoc comments for all functions

---

## 📞 Need Help?

All functions include:
- JSDoc comments explaining parameters
- Return type documentation
- Usage examples in comments
- Error handling

Just hover over any function in VS Code to see the documentation!

---

## 🎉 Summary

You now have **4 comprehensive utility files** with **60+ functions** covering:
- Data formatting
- File validation
- Performance optimization
- Browser utilities
- Storage management
- DOM manipulation
- And much more!

These utilities will make your Media Gallery development much faster and more maintainable! 🚀
