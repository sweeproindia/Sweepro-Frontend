// Performance optimization utilities for Instagram-style pagination

export const PAGINATION_DEFAULTS = {
  // Smaller initial loads for faster perceived performance
  DASHBOARD_RECENT: 8,
  USER_BOOKINGS: 10,
  USER_PAYMENTS: 10,
  USER_NOTIFICATIONS: 12,
  ADMIN_USERS: 12,
  ADMIN_BOOKINGS: 8,
  ADMIN_PAYMENTS: 10,
  ADMIN_MAIDS: 10,
  
  // Incremental loads (next page)
  INCREMENTAL_LOAD: 5,
  
  // Cache times (in milliseconds)
  CACHE_TIME: {
    DASHBOARD: 30_000, // 30 seconds
    LISTS: 60_000, // 1 minute
    ADMIN: 45_000, // 45 seconds
  }
};

// Skeleton timing configurations
export const SKELETON_TIMINGS = {
  MIN_DISPLAY_TIME: 300, // Minimum time to show skeleton (prevents flashing)
  STAGGER_DELAY: 50, // Delay between skeleton items for smooth appearance
  FADE_DURATION: 200, // Fade transition duration
};

// Debounce utility for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Intersection Observer options for infinite scroll
export const INTERSECTION_OPTIONS = {
  root: null,
  rootMargin: '100px', // Load next page when 100px from bottom
  threshold: 0.1,
};

// Virtual scrolling thresholds
export const VIRTUAL_SCROLL_THRESHOLDS = {
  ENABLE_AT: 100, // Enable virtual scrolling when more than 100 items
  BUFFER_SIZE: 10, // Number of items to render outside viewport
  ITEM_HEIGHT: 80, // Average item height in pixels
};

// Performance monitoring
export const performanceMonitor = {
  startTiming: (label: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${label}-start`);
    }
  },
  
  endTiming: (label: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label)[0];
      if (measure && process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
      }
    }
  }
};

// Memory management for large lists
export const memoryManager = {
  // Clean up old pages when we have too many
  cleanupOldPages: (pages: any[], maxPages: number = 10) => {
    if (pages.length > maxPages) {
      return pages.slice(-maxPages); // Keep only the last N pages
    }
    return pages;
  },
  
  // Calculate memory usage estimate
  estimateMemoryUsage: (items: any[]) => {
    const itemSize = JSON.stringify(items[0] || {}).length;
    const totalSize = items.length * itemSize;
    return {
      itemCount: items.length,
      estimatedSizeKB: Math.round(totalSize / 1024),
      shouldOptimize: totalSize > 1024 * 1024 // 1MB threshold
    };
  }
};

// Optimized query configurations
export const getOptimizedQueryConfig = (type: 'dashboard' | 'list' | 'admin') => {
  const baseConfig = {
    staleTime: PAGINATION_DEFAULTS.CACHE_TIME[type.toUpperCase() as keyof typeof PAGINATION_DEFAULTS.CACHE_TIME],
    cacheTime: PAGINATION_DEFAULTS.CACHE_TIME[type.toUpperCase() as keyof typeof PAGINATION_DEFAULTS.CACHE_TIME] * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  };

  switch (type) {
    case 'dashboard':
      return {
        ...baseConfig,
        refetchInterval: 60_000, // Refresh every minute for dashboard
      };
    case 'admin':
      return {
        ...baseConfig,
        refetchInterval: 120_000, // Refresh every 2 minutes for admin
      };
    default:
      return baseConfig;
  }
};

// Skeleton animation variants for framer-motion (if used)
export const skeletonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Loading state management
export class LoadingStateManager {
  private static instance: LoadingStateManager;
  private loadingStates: Map<string, boolean> = new Map();
  
  static getInstance() {
    if (!LoadingStateManager.instance) {
      LoadingStateManager.instance = new LoadingStateManager();
    }
    return LoadingStateManager.instance;
  }
  
  setLoading(key: string, isLoading: boolean) {
    this.loadingStates.set(key, isLoading);
  }
  
  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }
  
  getGlobalLoadingState(): boolean {
    return Array.from(this.loadingStates.values()).some(Boolean);
  }
}

export const loadingManager = LoadingStateManager.getInstance();
