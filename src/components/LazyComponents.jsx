'use client';

import { lazy, Suspense, memo } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components for better performance
const ChatBotEnhanced = lazy(() => import('./ChatBotEnhanced'));
const MessageFormatter = lazy(() => import('./MessageFormatter'));
const ComparisonView = lazy(() => import('./ComparisonView'));

// Loading component optimized for performance
const OptimizedLoader = memo(({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-cyan-500 mr-2`} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
});

OptimizedLoader.displayName = 'OptimizedLoader';

// HOC for lazy loading with error boundary
const withLazyLoading = (Component, fallback = <OptimizedLoader />) => {
  const LazyComponent = memo((props) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  ));
  
  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return LazyComponent;
};

// Optimized lazy components
export const LazyChat = withLazyLoading(
  ChatBotEnhanced, 
  <OptimizedLoader text="Loading chat..." />
);

export const LazyMessageFormatter = withLazyLoading(
  MessageFormatter,
  <OptimizedLoader size="small" text="Formatting message..." />
);

export const LazyComparisonView = withLazyLoading(
  ComparisonView,
  <OptimizedLoader text="Loading comparison..." />
);

export { OptimizedLoader, withLazyLoading };
