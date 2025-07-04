import { useEffect, useState } from 'react';

/**
 * Hook to handle browser extension interference with React hydration
 * This helps prevent hydration warnings caused by browser extensions
 * that modify the DOM after SSR but before hydration
 */
export function useHydrationFix() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // List of known attributes injected by browser extensions
    const extensionAttributes = [
      'bbai-tooltip-injected',
      'data-extension-id',
      'data-grammarly-shadow-root',
      'data-lt-installed',
      'data-adblock-key',
      'cz-shortcut-listen'
    ];

    // Function to clean up extension attributes
    const cleanupExtensionAttributes = () => {
      const html = document.documentElement;
      const body = document.body;

      extensionAttributes.forEach(attr => {
        if (html.hasAttribute(attr)) {
          html.removeAttribute(attr);
        }
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
      });
    };

    // Clean up immediately
    cleanupExtensionAttributes();

    // Set up a mutation observer to clean up any future additions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          const attributeName = mutation.attributeName;
          
          if (extensionAttributes.includes(attributeName)) {
            target.removeAttribute(attributeName);
          }
        }
      });
    });

    // Observe changes to html and body elements
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: extensionAttributes
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: extensionAttributes
    });

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, []);
}

/**
 * Component wrapper that handles hydration issues
 * Use this for components that might be affected by browser extensions
 */
export function HydrationBoundary({ children, fallback = null }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show fallback during hydration to prevent mismatches
  if (!isHydrated) {
    return fallback;
  }

  return children;
}

export default useHydrationFix;
