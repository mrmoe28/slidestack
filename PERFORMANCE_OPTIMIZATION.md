# Performance Optimization Plan

## 🔍 Identified Bottlenecks

### 1. **Slow Project Navigation**
- Database query runs on every page load (no caching)
- All editor components load immediately (even if not visible)
- No prefetching of project data

### 2. **Slow Project Data Loading**
- Project config not loaded on mount (clips state starts empty)
- No loading skeletons during data fetch
- Heavy components block initial render

### 3. **Heavy Client Bundle**
- Timeline component is very large (~700+ lines)
- All editor components in single bundle
- No progressive enhancement

---

## 🚀 Optimization Strategy

### Priority 1: Immediate Wins (30min - 1hr)

#### A. Load Saved Project Config on Mount
**Problem**: Clips state starts empty, doesn't load saved timeline
**Fix**: Load timeline from `project.config` in useEffect

```typescript
useEffect(() => {
  // Load saved timeline from project config
  if (project.config && typeof project.config === 'object') {
    const config = project.config as { timeline?: TimelineClip[] }
    if (config.timeline && Array.isArray(config.timeline)) {
      setClips(config.timeline)
    }
  }
}, [project])
```

**Impact**: Instantly shows saved work instead of empty editor

#### B. Add React Suspense Boundaries
**Problem**: All components load at once, blocking render
**Fix**: Wrap each heavy section in Suspense

```typescript
<Suspense fallback={<MediaLibrarySkeleton />}>
  <MediaUploader projectId={project.id} />
</Suspense>

<Suspense fallback={<TimelineSkeleton />}>
  <Timeline onClipsChange={handleClipsChange} />
</Suspense>
```

**Impact**: Progressive loading, faster initial render

#### C. Enable Next.js Caching
**Problem**: Fresh DB query on every navigation
**Fix**: Add revalidation tags and cache control

```typescript
// In page.tsx
export const revalidate = 60 // Cache for 60 seconds

// Or use Next.js tags for on-demand revalidation
export async function generateStaticParams() {
  // Pre-generate common project routes
}
```

**Impact**: Instant navigation for recently visited projects

---

### Priority 2: Medium Impact (1-2hrs)

#### D. Implement Route Prefetching
**Problem**: No data loaded until user clicks
**Fix**: Prefetch on hover/focus

```typescript
// In project list
<Link
  href={`/projects/${project.id}/edit`}
  prefetch={true} // Next.js prefetches on hover
  onMouseEnter={() => router.prefetch(`/projects/${project.id}/edit`)}
>
```

**Impact**: Near-instant navigation

#### E. Add Loading Skeletons
**Problem**: White screen during load
**Fix**: Show skeleton UI

```typescript
// loading.tsx in app/(main)/projects/[id]/edit/
export default function Loading() {
  return <EditorSkeleton />
}
```

**Impact**: Perceived performance improvement

#### F. Optimize Timeline Component
**Problem**: Very large component with many effects
**Fix**: Split into smaller sub-components

```typescript
// Before: One massive Timeline component
<Timeline /> // 700+ lines

// After: Modular components
<Timeline>
  <TimelineHeader />
  <TimelineTrack track="video" />
  <TimelineTrack track="audio" />
  <TimelineTrack track="text" />
  <TimelineControls />
</Timeline>
```

**Impact**: Faster renders, better code splitting

---

### Priority 3: Advanced Optimizations (2-4hrs)

#### G. Implement Virtual Scrolling for Timeline
**Problem**: Rendering 100+ clips causes lag
**Fix**: Use react-window or react-virtual

```typescript
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={300}
  itemCount={clips.length}
  itemSize={80}
>
  {({ index, style }) => <TimelineClip clip={clips[index]} style={style} />}
</FixedSizeList>
```

**Impact**: Smooth scrolling with 1000+ clips

#### H. Add Optimistic UI Updates
**Problem**: Save button shows loading for 1-2 seconds
**Fix**: Update UI immediately, rollback on error

```typescript
const handleSave = async () => {
  const previousClips = clips

  // Optimistic update
  toast.success('Saved!', { duration: 1000 })

  try {
    await fetch('/api/projects/${project.id}', {
      method: 'PATCH',
      body: JSON.stringify({ config: { timeline: clips } })
    })
  } catch (error) {
    // Rollback on error
    setClips(previousClips)
    toast.error('Save failed')
  }
}
```

**Impact**: Instant feedback

#### I. Use IndexedDB for Client-Side Caching
**Problem**: Repeated API calls for same data
**Fix**: Cache timeline data in browser

```typescript
// Use localForage or Dexie.js
import localforage from 'localforage'

// Save to cache
await localforage.setItem(`project-${projectId}-timeline`, clips)

// Load from cache first
const cachedClips = await localforage.getItem(`project-${projectId}-timeline`)
if (cachedClips) {
  setClips(cachedClips) // Instant load
}
// Then fetch fresh data in background
fetchLatestTimeline()
```

**Impact**: Sub-100ms load times

---

## 📊 Expected Performance Improvements

| Optimization | Current | After | Improvement |
|--------------|---------|-------|-------------|
| Project Navigation | 2-3s | 200-500ms | **85% faster** |
| Initial Render | 1-2s | 300-600ms | **70% faster** |
| Data Load | 1-2s | <100ms (cached) | **95% faster** |
| Timeline Scroll | Laggy | 60fps | **Smooth** |
| Save Feedback | 1-2s | Instant | **100% faster perceived** |

---

## 🛠️ Implementation Order

### Phase 1 (Today - 1 hour)
1. ✅ Load saved project config on mount
2. ✅ Add loading skeletons
3. ✅ Enable route prefetching

### Phase 2 (Tomorrow - 2 hours)
4. Add Suspense boundaries
5. Enable Next.js caching
6. Optimize timeline component structure

### Phase 3 (This Week - 4 hours)
7. Implement optimistic UI
8. Add IndexedDB caching
9. Virtual scrolling for timeline

---

## 🔍 Monitoring

After implementing, track these metrics:

```typescript
// Add performance monitoring
useEffect(() => {
  const navigationStart = performance.now()

  return () => {
    const duration = performance.now() - navigationStart
    console.log(`Page loaded in ${duration}ms`)

    // Send to analytics
    analytics.track('page_load', { duration, projectId })
  }
}, [])
```

Track:
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

**Target Metrics**:
- LCP < 2.5s
- FCP < 1.8s
- TTI < 3.5s

---

## 💡 Quick Wins Checklist

- [x] Research bottlenecks
- [ ] Load project config on mount
- [ ] Add loading skeletons
- [ ] Enable route prefetching
- [ ] Add Suspense boundaries
- [ ] Enable Next.js caching
- [ ] Split Timeline component
- [ ] Add optimistic UI
- [ ] Implement client-side caching
- [ ] Add virtual scrolling

---

**Last Updated**: 2025-10-08
**Status**: Ready to implement Phase 1
