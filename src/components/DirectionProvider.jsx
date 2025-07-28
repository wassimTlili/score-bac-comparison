'use client';

import { useI18n } from '../app/i18n/client';
import { useEffect } from 'react';

/**
 * DirectionProvider component that handles RTL/LTR layout switching
 * This component automatically updates the document direction and applies appropriate styles
 */
export default function DirectionProvider({ children }) {
  const { direction, locale, loading } = useI18n();

  useEffect(() => {
    // Update document direction and language
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = locale;
      
      // Add or remove RTL class for additional styling if needed
      if (direction === 'rtl') {
        document.documentElement.classList.add('rtl');
        document.documentElement.classList.remove('ltr');
      } else {
        document.documentElement.classList.add('ltr');
        document.documentElement.classList.remove('rtl');
      }
    }
  }, [direction, locale]);

  // Apply RTL-aware styling to the main wrapper
  const wrapperClassName = `min-h-screen transition-all duration-300 ${
    direction === 'rtl' ? 'rtl font-arabic' : 'ltr font-latin'
  }`;

  return (
    <div 
      className={wrapperClassName}
      dir={direction}
      lang={locale}
      style={{
        fontFamily: direction === 'rtl' 
          ? 'Cairo, "Noto Sans Arabic", system-ui, sans-serif'
          : 'Inter, system-ui, sans-serif'
      }}
    >
      {children}
      
      {/* Loading overlay during language change */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
              <span className="text-white font-medium">Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
