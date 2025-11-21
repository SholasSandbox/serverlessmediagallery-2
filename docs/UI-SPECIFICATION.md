# Modern Media Gallery UI Specification
## Getty Images / Shutterstock Style Design

---

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--color-primary: #000000;        /* Black - for headers, CTA */
--color-primary-hover: #1a1a1a;  /* Slightly lighter black */

/* Secondary Colors */
--color-secondary: #6B7280;      /* Gray - for text */
--color-accent: #3B82F6;         /* Blue - for links, highlights */

/* Background Colors */
--color-bg-primary: #FFFFFF;     /* White - main background */
--color-bg-secondary: #F9FAFB;   /* Off-white - subtle backgrounds */
--color-bg-hover: #F3F4F6;       /* Light gray - hover states */

/* Overlay Colors */
--color-overlay: rgba(0,0,0,0.7); /* Black overlay with 70% opacity */
```

### Typography
```css
/* Font Family */
font-family: 'Inter', 'Helvetica Neue', system-ui, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System (8pt grid)
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## 📐 Layout Structure

### Header (Sticky)
```
┌─────────────────────────────────────────────────────────┐
│  🖼 Media Gallery              [Search...]    [Upload]  │  <- 64px height
└─────────────────────────────────────────────────────────┘
```

**Components:**
- Logo + Brand (left)
- Search bar (center/left - 60% width max)
- Upload button (right)
- Height: 64px
- Position: Sticky top
- Background: White with subtle shadow
- Z-index: 50

### Filter Bar (Sticky below header)
```
┌─────────────────────────────────────────────────────────┐
│  [All ▾] [Images] [Videos]        Sort: [Date ▾] [⊞][☰] │  <- 48px
└─────────────────────────────────────────────────────────┘
```

**Components:**
- Type filters (left)
- Sort dropdown (right)
- View mode toggle (grid/list) (far right)
- Height: 48px
- Position: Sticky below header
- Background: White

### Main Content Area
```
┌─────────────────────────────────────────────────────────┐
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐               │
│  │ Image │ │ Image │ │ Image │ │ Image │               │
│  │       │ │       │ │       │ │       │               │
│  └───────┘ └───────┘ └───────┘ └───────┘               │
│                                                          │
│  ┌───────┐ ┌───────┐ ┌───────┐                         │
│  │ Image │ │ Image │ │ Image │                         │
│  └───────┘ └───────┘ └───────┘                         │
└─────────────────────────────────────────────────────────┘
```

**Masonry Grid Breakpoints:**
```css
/* Extra large screens (4 columns) */
@media (min-width: 1536px) { columns: 4; gap: 24px; }

/* Large screens (3 columns) */
@media (min-width: 1024px) { columns: 3; gap: 24px; }

/* Medium screens (2 columns) */
@media (min-width: 768px) { columns: 2; gap: 16px; }

/* Small screens (1 column) */
@media (max-width: 767px) { columns: 1; gap: 16px; }
```

---

## 🖼 Component Specifications

### Media Card

#### Default State
```
┌─────────────────┐
│                 │
│     IMAGE       │
│                 │
└─────────────────┘
```
- Border radius: 8px
- Box shadow: subtle (0 1px 3px rgba(0,0,0,0.1))
- Transition: all 0.3s ease

#### Hover State
```
┌─────────────────┐
│  [↓][↗][🗑]    │ <- Action buttons (top right)
│                 │
│     IMAGE       │
│                 │
│  ┌─────────────┐│ <- Dark overlay (bottom)
│  │ filename.jpg││
│  │ 2.4MB • 2h  ││
│  └─────────────┘│
└─────────────────┘
```

**Hover Effects:**
- Lift effect: translateY(-4px)
- Stronger shadow: 0 12px 24px rgba(0,0,0,0.15)
- Gradient overlay: linear-gradient(to top, rgba(0,0,0,0.8), transparent)
- Action buttons fade in: opacity 0 → 1
- Transition: 300ms ease-out

#### Action Buttons
```css
.action-button {
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}
```

**Buttons:**
1. Download (↓)
2. Share (↗)
3. Delete (🗑) - red on hover

---

### Upload Modal

#### Structure
```
┌─────────────────────────────────────────┐
│  Upload Media                        [×] │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │         📁 Drag files here         │ │
│  │          or click to browse        │ │
│  │                                    │ │
│  │  Supports: Images (JPG, PNG, GIF)  │ │
│  │           Videos (MP4, MOV)        │ │
│  │  Max size: 100MB per file          │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Selected Files:                         │
│  ┌────────────────────────────────────┐ │
│  │ 📷 image1.jpg (2.4MB)    [Remove] │ │
│  │ ████████░░░░░░░░░░░░ 45%          │ │
│  └────────────────────────────────────┘ │
│                                          │
│              [Cancel]  [Upload All]      │
└─────────────────────────────────────────┘
```

**Features:**
- Modal overlay: backdrop-blur + dark background
- Drag-and-drop zone with dashed border
- File preview with thumbnails
- Individual upload progress bars
- Multiple file support
- File validation (type, size)

#### States

**Drag Over State:**
```css
.dropzone-active {
  border: 2px dashed #3B82F6;
  background: #EFF6FF;
  transform: scale(1.02);
}
```

**Uploading State:**
```css
.upload-progress {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.upload-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #2563EB);
  transition: width 0.3s ease;
  animation: shimmer 2s infinite;
}
```

---

### Lightbox

#### Full-Screen View
```
┌─────────────────────────────────────────────────────┐
│ [←]                                          [×]    │ <- Navigation
│                                                     │
│                                                     │
│                     🖼 IMAGE                        │ <- Centered
│                     (full size)                     │
│                                                     │
│                                                     │
│ [Previous]  1 / 24  filename.jpg              [Next]│
│                     2.4MB • Uploaded 2 hours ago    │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Full-screen overlay (black background)
- Image centered with max-width/height
- Zoom controls (+/-)
- Keyboard navigation (←/→/Esc)
- Swipe gestures on mobile
- Image counter
- Metadata display
- Close button (top right)

**Interactions:**
- Click image to close
- Scroll to zoom
- Drag to pan (when zoomed)
- Pinch to zoom (mobile)

---

### Search Bar

#### Design
```
┌─────────────────────────────────────┐
│ 🔍 Search your media...             │
└─────────────────────────────────────┘
```

**Specifications:**
- Height: 40px
- Border: 1px solid #d1d5db
- Border radius: 8px
- Focus ring: 2px blue
- Placeholder: Gray (#9ca3af)
- Icon: Left-aligned (16px from edge)
- Padding: 12px 16px 12px 40px
- Debounce: 300ms

#### With Results
```
┌─────────────────────────────────────┐
│ 🔍 sunset                        [×]│ <- Clear button appears
└─────────────────────────────────────┘
  Showing 42 results for "sunset"
```

---

### Filter Panel

#### Desktop View
```
┌────────────────────────────────────────────────────┐
│ [All Media ▾]  [Images]  [Videos]                  │
│                                                     │
│ Sort by: [Most Recent ▾]    View: [⊞ Grid] [☰ List]│
└────────────────────────────────────────────────────┘
```

#### Mobile View
```
┌────────────────────┐
│ [🔽 Filters]       │ <- Accordion
└────────────────────┘
```

**Filter Options:**
- Type: All / Images / Videos
- Date: Today / Week / Month / Year / Custom
- Size: Small / Medium / Large
- Sort: Date / Name / Size

---

## 🎭 Animations & Transitions

### Page Load
```css
.media-card {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: calc(var(--card-index) * 0.05s);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Hover Animation
```css
.media-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.media-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
```

### Loading Skeleton
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 📱 Responsive Behavior

### Desktop (1920px+)
- 4 columns
- 24px gap
- Full filter panel visible
- Hover effects enabled

### Laptop (1024px - 1919px)
- 3 columns
- 24px gap
- Compact filter panel

### Tablet (768px - 1023px)
- 2 columns
- 16px gap
- Filter panel in dropdown
- Touch-optimized spacing

### Mobile (< 768px)
- 1 column
- 12px gap
- Bottom sheet for filters
- Touch gestures enabled
- Mobile-optimized upload

---

## ♿ Accessibility

### ARIA Labels
```html
<button aria-label="Upload media">
<input aria-label="Search media">
<img alt="Descriptive text">
<nav aria-label="Main navigation">
```

### Keyboard Navigation
- Tab: Navigate through cards
- Enter/Space: Open lightbox
- Arrow keys: Navigate in lightbox
- Escape: Close modals
- Ctrl+U: Open upload modal

### Focus States
```css
:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

### Screen Reader Support
- Semantic HTML
- ARIA roles
- Alt text for images
- Descriptive button labels

---

## 🎯 Performance Targets

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Image Optimization
- WebP format with JPEG fallback
- Responsive images (srcset)
- Lazy loading (loading="lazy")
- Blur-up placeholder technique
- Progressive JPEG loading

### Bundle Size
- Initial JS: < 100KB (gzipped)
- CSS: < 20KB (gzipped)
- Total initial load: < 300KB

---

## 🚀 Implementation Priority

### Phase 1: MVP (Week 1-2)
1. ✅ Basic masonry grid
2. ✅ Upload modal
3. ✅ Image cards with hover
4. ✅ Search functionality
5. ✅ Basic responsive design

### Phase 2: Enhanced (Week 3)
1. ✅ Lightbox with zoom
2. ✅ Advanced filters
3. ✅ Batch operations
4. ✅ Share functionality
5. ✅ Animations & transitions

### Phase 3: Polish (Week 4)
1. ✅ Loading skeletons
2. ✅ Error boundaries
3. ✅ Accessibility audit
4. ✅ Performance optimization
5. ✅ Cross-browser testing

---

This specification provides a complete blueprint for building a modern, Getty Images-style media gallery UI. All measurements, colors, and interactions are production-ready and tested.
