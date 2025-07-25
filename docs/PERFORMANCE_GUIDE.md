# React Performance Optimization Guide for ForgeTrain

## 🚀 Performance Libraries Implementation Guide

This comprehensive guide covers implementing performance libraries in React applications, specifically tailored for the ForgeTrain platform.

---

## 1. React.lazy + Suspense (Code Splitting)

### **Problem Solved**
Reduces initial bundle size by loading components only when needed, improving First Contentful Paint (FCP) and Time to Interactive (TTI).

### **Installation**
```bash
# Built into React - no installation needed
```

### **Implementation**

#### Basic Route-Level Code Splitting
```tsx
// src/components/LazyComponents.tsx
import React, { Suspense } from 'react'
import { motion } from 'framer-motion'

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-[#094d57] border-t-transparent rounded-full"
    />
  </div>
)

// Lazy load pages
const Dashboard = React.lazy(() => import('../pages/Dashboard'))
const CoursesPage = React.lazy(() => import('../pages/CoursesPage'))
const ChallengesPage = React.lazy(() => import('../pages/ChallengesPage'))
const QuizzesPage = React.lazy(() => import('../pages/QuizzesPage'))

// Usage in App.tsx
export function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
      </Routes>
    </Suspense>
  )
}
```

#### Component-Level Code Splitting
```tsx
// Heavy components that aren't immediately needed
const CodeEditor = React.lazy(() => import('./CodeEditor'))
const VideoPlayer = React.lazy(() => import('./VideoPlayer'))
const ChartDashboard = React.lazy(() => import('./ChartDashboard'))

// Usage with error boundaries
const LazyCodeEditor = () => (
  <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
    <CodeEditor />
  </Suspense>
)
```

### **Key Configuration Options**
- **Preloading**: Use `import()` in event handlers for predictive loading
- **Error Boundaries**: Wrap lazy components to handle loading failures
- **Nested Suspense**: Multiple Suspense boundaries for granular loading

### **Performance Benefits**
- ✅ **30-50% reduction** in initial bundle size
- ✅ **Faster initial page load** (2-3 seconds improvement)
- ✅ **Better Core Web Vitals** scores

### **When to Use**
- ✅ Route-level splitting for different pages
- ✅ Heavy components (charts, editors, media players)
- ✅ Admin panels or rarely accessed features

### **When NOT to Use**
- ❌ Small components (<10KB)
- ❌ Components needed immediately on page load
- ❌ Shared components used across many routes

---

## 2. TanStack Query (Data Fetching & Caching)

### **Problem Solved**
Eliminates redundant API calls, provides intelligent caching, background updates, and optimistic updates for better UX.

### **Installation**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### **Implementation**

#### Basic Setup
```tsx
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false
        return failureCount < 3
      },
    },
    mutations: {
      retry: 1,
    },
  },
})
```

#### Custom Hooks for ForgeTrain
```tsx
// src/hooks/useCourses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useCourses(filters?: { difficulty?: string; category?: string }) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      let query = supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
      
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for course data
  })
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { error } = await supabase
        .from('user_enrollments')
        .insert({ user_id: userId, module_id: courseId })
      
      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['user-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['user-progress'] })
    },
    onMutate: async ({ courseId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['courses'] })
      
      const previousCourses = queryClient.getQueryData(['courses'])
      
      queryClient.setQueryData(['courses'], (old: any) => {
        return old?.map((course: any) => 
          course.id === courseId 
            ? { ...course, enrolled: true }
            : course
        )
      })
      
      return { previousCourses }
    },
  })
}
```

#### Infinite Queries for Large Lists
```tsx
// src/hooks/useInfiniteChallenges.ts
export function useInfiniteChallenges() {
  return useInfiniteQuery({
    queryKey: ['challenges'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('code_challenges')
        .select('*')
        .range(pageParam * 20, (pageParam + 1) * 20 - 1)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length : undefined
    },
  })
}
```

### **Key Configuration Options**
- **staleTime**: How long data is considered fresh
- **cacheTime**: How long unused data stays in cache
- **refetchInterval**: Background refetch frequency
- **retry**: Retry failed requests logic

### **Performance Benefits**
- ✅ **60-80% reduction** in API calls
- ✅ **Instant navigation** with cached data
- ✅ **Background updates** keep data fresh
- ✅ **Optimistic updates** for better UX

### **When to Use**
- ✅ Any data fetching in your app
- ✅ Lists that need pagination
- ✅ Data that changes frequently
- ✅ Complex state synchronization

---

## 3. react-window (List Virtualization)

### **Problem Solved**
Renders only visible items in large lists, dramatically improving performance for thousands of items.

### **Installation**
```bash
npm install react-window react-window-infinite-loader
npm install --save-dev @types/react-window
```

### **Implementation**

#### Virtualized Course List
```tsx
// src/components/VirtualizedCourseList.tsx
import React from 'react'
import { FixedSizeList as List } from 'react-window'
import { Card, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'

interface Course {
  id: string
  title: string
  difficulty: string
  duration: number
}

interface CourseItemProps {
  index: number
  style: React.CSSProperties
  data: Course[]
}

const CourseItem: React.FC<CourseItemProps> = ({ index, style, data }) => {
  const course = data[index]
  
  return (
    <div style={style} className="px-4 py-2">
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{course.title}</h3>
              <p className="text-sm text-gray-600">{course.duration} hours</p>
            </div>
            <Badge variant="info">{course.difficulty}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface VirtualizedCourseListProps {
  courses: Course[]
  height: number
}

export const VirtualizedCourseList: React.FC<VirtualizedCourseListProps> = ({
  courses,
  height
}) => {
  return (
    <List
      height={height}
      itemCount={courses.length}
      itemSize={120} // Height of each item
      itemData={courses}
      overscanCount={5} // Render 5 extra items for smooth scrolling
    >
      {CourseItem}
    </List>
  )
}
```

#### Infinite Loading with Virtualization
```tsx
// src/components/InfiniteVirtualList.tsx
import InfiniteLoader from 'react-window-infinite-loader'
import { VariableSizeList as List } from 'react-window'

export const InfiniteVirtualChallengeList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteChallenges()
  
  const items = data?.pages.flatMap(page => page) ?? []
  const itemCount = hasNextPage ? items.length + 1 : items.length
  
  const isItemLoaded = (index: number) => !!items[index]
  
  const loadMoreItems = isFetchingNextPage ? () => {} : fetchNextPage
  
  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <List
          ref={ref}
          height={600}
          itemCount={itemCount}
          itemSize={() => 150}
          onItemsRendered={onItemsRendered}
        >
          {({ index, style }) => (
            <div style={style}>
              {items[index] ? (
                <ChallengeCard challenge={items[index]} />
              ) : (
                <div className="p-4 animate-pulse">Loading...</div>
              )}
            </div>
          )}
        </List>
      )}
    </InfiniteLoader>
  )
}
```

### **Performance Benefits**
- ✅ **90%+ performance improvement** for lists >1000 items
- ✅ **Constant memory usage** regardless of list size
- ✅ **Smooth scrolling** even with 10,000+ items

### **When to Use**
- ✅ Lists with >100 items
- ✅ Complex list items with heavy rendering
- ✅ Infinite scrolling implementations
- ✅ Tables with many rows

---

## 4. vite-plugin-compression (Asset Compression)

### **Problem Solved**
Reduces bundle size by 60-80% through gzip/brotli compression, improving load times.

### **Installation**
```bash
npm install --save-dev vite-plugin-compression
```

### **Implementation**
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files larger than 1KB
      deleteOriginFile: false,
    }),
    // Brotli compression (better compression ratio)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'framer-motion'],
          utils: ['date-fns', 'clsx'],
        },
      },
    },
  },
})
```

### **Performance Benefits**
- ✅ **60-80% smaller** bundle sizes
- ✅ **2-3x faster** download times
- ✅ **Reduced bandwidth** costs

---

## 5. vite-imagetools (Image Optimization)

### **Problem Solved**
Automatically optimizes images, generates multiple formats (WebP, AVIF), and creates responsive images.

### **Installation**
```bash
npm install --save-dev vite-imagetools
```

### **Implementation**
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  plugins: [
    react(),
    imagetools({
      defaultDirectives: (url) => {
        if (url.searchParams.has('responsive')) {
          return new URLSearchParams({
            format: 'webp;jpg',
            quality: '80',
            w: '400;800;1200',
          })
        }
        return new URLSearchParams()
      },
    }),
  ],
})
```

```tsx
// Usage in components
import heroImage from '../assets/hero.jpg?responsive'
import courseThumbnail from '../assets/course.jpg?w=400&h=300&format=webp&quality=80'

export const HeroSection = () => {
  return (
    <picture>
      <source
        srcSet={heroImage.webp.srcset}
        sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
        type="image/webp"
      />
      <img
        src={heroImage.jpg.src}
        srcSet={heroImage.jpg.srcset}
        alt="ForgeTrain Hero"
        className="w-full h-auto"
      />
    </picture>
  )
}
```

### **Performance Benefits**
- ✅ **50-70% smaller** image sizes
- ✅ **Modern formats** (WebP, AVIF) support
- ✅ **Responsive images** for different screen sizes

---

## 6. vite-plugin-pwa (Progressive Web App)

### **Problem Solved**
Enables offline functionality, app-like experience, and intelligent caching strategies.

### **Installation**
```bash
npm install --save-dev vite-plugin-pwa workbox-window
```

### **Implementation**
```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'ForgeTrain - Coding Practice Platform',
        short_name: 'ForgeTrain',
        description: 'Master coding with interactive tutorials and challenges',
        theme_color: '#094d57',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: /^https:\/\/images\.pexels\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
})
```

```tsx
// src/hooks/usePWA.ts
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePWA() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  return {
    needRefresh,
    updateServiceWorker,
    setNeedRefresh,
  }
}
```

### **Performance Benefits**
- ✅ **Offline functionality** for core features
- ✅ **Instant loading** for cached resources
- ✅ **App-like experience** on mobile devices

---

## 7. @fontsource (Self-Hosted Fonts)

### **Problem Solved**
Eliminates external font requests, improves loading performance, and ensures font availability.

### **Installation**
```bash
npm install @fontsource/inter @fontsource/jetbrains-mono
```

### **Implementation**
```tsx
// src/main.tsx
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/jetbrains-mono/400.css' // For code blocks

// tailwind.config.js
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
    },
  },
}
```

### **Performance Benefits**
- ✅ **Eliminates FOUT** (Flash of Unstyled Text)
- ✅ **Faster font loading** (no external requests)
- ✅ **Better Core Web Vitals** scores

---

## 🎯 Performance Monitoring

### **Bundle Analysis**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### **Performance Metrics to Track**
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Time to Interactive (TTI)**: < 3.8s

### **Expected Performance Improvements**
- ✅ **70-80% faster** initial page load
- ✅ **90% reduction** in API calls with TanStack Query
- ✅ **60-80% smaller** bundle sizes with compression
- ✅ **Smooth 60fps** scrolling with virtualization
- ✅ **Offline functionality** with PWA

This comprehensive guide provides production-ready performance optimizations that will significantly improve the ForgeTrain platform's user experience and Core Web Vitals scores.