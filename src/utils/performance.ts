/**
 * Performance monitoring utilities for React components
 */
import React from 'react';

/**
 * Performance measurement decorator for functions
 * @param name - Name of the measurement
 * @param fn - Function to measure
 * @returns Wrapped function with performance measurement
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    if (process.env.NODE_ENV === 'development') {
      const startMark = `${name}-start`;
      const endMark = `${name}-end`;
      const measureName = `${name}-measure`;

      window.performance.mark(startMark);
      const result = fn(...args);
      window.performance.mark(endMark);
      window.performance.measure(measureName, startMark, endMark);

      // Log performance in development
      const measure = window.performance.getEntriesByName(measureName)[0];
      if (measure && measure.duration > 10) {
        console.warn(
          `Performance warning: ${name} took ${measure.duration.toFixed(2)}ms`
        );
      }

      return result;
    }

    return fn(...args);
  }) as T;
}

/**
 * React hook for measuring component render performance
 * @param componentName - Name of the component
 * @param dependencies - Dependencies to track for re-renders
 */
export function usePerformanceMonitor(
  componentName: string,
  dependencies: React.DependencyList = []
): void {
  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(0);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCount.current += 1;
      const currentTime = window.performance.now();

      if (lastRenderTime.current === 0) {
        lastRenderTime.current = currentTime;
        return;
      }

      const timeSinceLastRender = currentTime - lastRenderTime.current;

      if (renderCount.current > 1 && timeSinceLastRender < 16) {
        console.warn(
          `Performance warning: ${componentName} re-rendered ${renderCount.current} times. Last render was ${timeSinceLastRender.toFixed(2)}ms ago.`
        );
      }

      lastRenderTime.current = currentTime;
    }
  });

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && renderCount.current > 1) {
      console.log(
        `${componentName} re-rendered due to dependency change. Render count: ${renderCount.current}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentName, ...dependencies]);
}

/**
 * Debounce function to prevent excessive function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function call frequency
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoization utility for expensive calculations
 * @param fn - Function to memoize
 * @param getKey - Function to generate cache key
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    // Prevent memory leaks by limiting cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return result;
  }) as T;
}

/**
 * Performance profiler for React components
 */
export class ComponentProfiler {
  private static instance: ComponentProfiler;
  private profiles: Map<string, number[]> = new Map();

  static getInstance(): ComponentProfiler {
    if (!ComponentProfiler.instance) {
      ComponentProfiler.instance = new ComponentProfiler();
    }
    return ComponentProfiler.instance;
  }

  startProfile(componentName: string): void {
    if (process.env.NODE_ENV === 'development') {
      window.performance.mark(`${componentName}-start`);
    }
  }

  endProfile(componentName: string): void {
    if (process.env.NODE_ENV === 'development') {
      const endMark = `${componentName}-end`;
      const measureName = `${componentName}-measure`;

      window.performance.mark(endMark);
      window.performance.measure(
        measureName,
        `${componentName}-start`,
        endMark
      );

      const measure = window.performance.getEntriesByName(measureName)[0];
      if (measure) {
        const times = this.profiles.get(componentName) || [];
        times.push(measure.duration);
        this.profiles.set(componentName, times);

        // Keep only last 10 measurements
        if (times.length > 10) {
          times.shift();
        }
      }
    }
  }

  getAverageRenderTime(componentName: string): number {
    const times = this.profiles.get(componentName);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  logPerformanceReport(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('Component Performance Report');
      this.profiles.forEach((times, componentName) => {
        const average = this.getAverageRenderTime(componentName);
        const max = Math.max(...times);
        const min = Math.min(...times);

        console.log(`${componentName}:`, {
          average: `${average.toFixed(2)}ms`,
          max: `${max.toFixed(2)}ms`,
          min: `${min.toFixed(2)}ms`,
          samples: times.length,
        });
      });
      console.groupEnd();
    }
  }
}
