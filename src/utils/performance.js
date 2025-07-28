// Production Performance Utilities

// Environment check for development features
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Conditional logging - only in development
export const devLog = (...args) => {
  if (isDevelopment) {}
};

export const devError = (...args) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

export const devWarn = (...args) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

// Performance monitoring utilities
export const performanceMarker = {
  start: (name) => {
    if (isDevelopment && typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-start`);
    }
  },
  
  end: (name) => {
    if (isDevelopment && typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-end`);
      window.performance.measure(name, `${name}-start`, `${name}-end`);
    }
  },
  
  measure: (name) => {
    if (isDevelopment && typeof window !== 'undefined' && window.performance) {
      const measures = window.performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        devLog(`Performance: ${name} took ${measures[0].duration.toFixed(2)}ms`);
      }
    }
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  check: () => {
    if (isDevelopment && typeof window !== 'undefined' && window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      devLog('Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
};

// Error boundary utility
export const handleError = (error, errorInfo = {}) => {
  if (isProduction) {
    // In production, log errors to external service
    // e.g., Sentry, LogRocket, etc.
    // For now, just silence them
    return;
  } else {
    devError('Error caught:', error, errorInfo);
  }
};

// Debounce utility for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Bundle size analyzer utility
export const bundleAnalyzer = {
  logComponentSize: (componentName, component) => {
    if (isDevelopment) {
      const size = JSON.stringify(component).length;
      devLog(`Component ${componentName} approximate size: ${size} bytes`);
    }
  }
};
