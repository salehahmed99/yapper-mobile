# Profile Module Performance Optimizations

## Overview

This document outlines the performance optimizations applied to the profile module to ensure optimal caching, rendering, and user experience without affecting the design or functionality.

## Key Optimizations Applied

### 1. Centralized Query Configuration (`config/queryConfig.ts`)

- **Query Key Factory**: Centralized query key generation using `profileQueryKeys` prevents key mismatches and enables easy cache invalidation
- **Consistent Cache Times**:
  - User profiles: 5 min staleTime, 10 min gcTime
  - Tweets/posts: 2 min staleTime, 5 min gcTime
  - Social lists: 3 min staleTime, 7 min gcTime
- **Refetch Settings**: Disabled refetch on window focus, enabled on reconnect

### 2. Hook Optimizations

#### `useUserPosts`, `useUserLikes`, `useUserMedia`

- Added `staleTime` and `gcTime` from centralized config
- Memoized data transformation with `useMemo` to prevent unnecessary re-computations
- Used query key factory for consistent cache keys
- Disabled refetch on window focus to reduce unnecessary API calls

#### `useFollowersList`, `useFollowingList`

- Already well-optimized with proper staleTime/gcTime
- Maintained existing structure (no changes needed)

### 3. Component Optimizations

#### `ProfilePostsList`

- Wrapped in `React.memo` to prevent unnecessary re-renders
- Created memoized `TweetItem` sub-component for individual tweet rendering
- Used `useCallback` for `renderTweetItem` function
- Only re-renders when data actually changes

#### `ProfileTabs`

- Wrapped in `React.memo` with display name
- Memoized tabs array configuration with `useMemo`
- Prevents recreation of tab components on every render

#### `ProfileContainer`

- Wrapped `handleScroll` in `useCallback` with proper dependencies
- Prevents function recreation on every render
- Maintains scroll performance

### 4. Context Optimizations

#### `ProfilePostsContext`

- Added `useMemo` for context value to prevent provider re-renders
- Maintains stable reference for context consumers
- Reduces cascading re-renders in child components

## Performance Benefits

### Before Optimizations

- Queries refetched on every window focus
- Components re-rendered unnecessarily
- Data transformations recalculated on every render
- Inconsistent cache keys across components
- Context changes triggered unnecessary re-renders

### After Optimizations

- **Reduced API Calls**: staleTime prevents refetches for cached data
- **Faster Renders**: React.memo prevents unnecessary component updates
- **Lower Memory**: Proper gcTime removes stale data
- **Better UX**: Cached data shows instantly while background refresh happens
- **Consistent State**: Query key factory ensures cache coherence

## Cache Strategy

### Hierarchical Query Keys

```typescript
['profile'] // Root
├── ['profile', 'user', userId]
├── ['profile', 'tweets', userId]
│   ├── ['profile', 'tweets', userId, 'posts']
│   ├── ['profile', 'tweets', userId, 'likes']
│   └── ['profile', 'tweets', userId, 'media']
└── ['profile', 'social', userId]
    ├── ['profile', 'social', userId, 'followers']
    └── ['profile', 'social', userId, 'following']
```

### Cache Invalidation

- Use `profileQueryKeys` to invalidate specific queries
- Example: `queryClient.invalidateQueries({ queryKey: profileQueryKeys.userPosts(userId) })`

## Memoization Strategy

### When to Use React.memo

✅ Components that receive complex props
✅ Components rendered in lists
✅ Components with expensive rendering logic
❌ Simple presentational components
❌ Components that always re-render with parent

### When to Use useMemo

✅ Expensive computations (array transformations, filtering)
✅ Object/array creation passed as props
✅ Complex style calculations
❌ Simple primitive values
❌ Single property access

### When to Use useCallback

✅ Functions passed as props to memoized components
✅ Functions used in dependency arrays
✅ Event handlers passed to child components
❌ Functions only used locally
❌ Functions with no dependencies

## Testing & Validation

### Performance Metrics to Monitor

1. **API Call Frequency**: Check network tab for duplicate requests
2. **Render Count**: Use React DevTools Profiler
3. **Memory Usage**: Monitor over time in DevTools
4. **Cache Hit Rate**: Check React Query DevTools

### Validation Checklist

- ✅ All tabs load correctly
- ✅ Pagination works without issues
- ✅ Pull-to-refresh updates data
- ✅ Navigation maintains scroll position
- ✅ Like/unlike updates cache optimistically
- ✅ New tweets appear after creation
- ✅ Profile data refreshes appropriately

## Migration Notes

### Breaking Changes

- None - All optimizations are internal

### API Compatibility

- All existing hooks maintain the same interface
- No component prop changes required
- Fully backward compatible

## Future Enhancements

### Potential Improvements

1. **Virtual Scrolling**: Implement for large tweet lists (100+ items)
2. **Optimistic Updates**: Expand to follow/unfollow actions
3. **Prefetching**: Preload next tab data on mount
4. **Lazy Loading**: Defer non-visible tab data loading
5. **Service Worker**: Cache API responses for offline support

### Monitoring

- Add performance tracking with React DevTools Profiler
- Monitor query cache size and hit rates
- Track component render counts in production
