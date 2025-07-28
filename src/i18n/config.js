/**
 * i18n Configuration
 * Supports English (en), French (fr), and Arabic (ar) with RTL/LTR direction handling
 */

export const i18nConfig = {
  // Supported locales
  locales: ['en', 'fr', 'ar'],
  
  // Default locale (fallback)
  defaultLocale: 'en',
  
  // RTL languages - empty array to disable RTL layout changes
  rtlLocales: [],
  
  // Locale metadata
  localeData: {
    en: {
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr',
      dateFormat: 'MM/dd/yyyy',
      currency: 'USD',
      fonts: ['Inter', 'system-ui', 'sans-serif']
    },
    fr: {
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      direction: 'ltr',
      dateFormat: 'dd/MM/yyyy',
      currency: 'EUR',
      fonts: ['Inter', 'system-ui', 'sans-serif']
    },
    ar: {
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇹🇳',
      direction: 'rtl',
      dateFormat: 'yyyy/MM/dd',
      currency: 'TND',
      fonts: ['Cairo', 'Noto Sans Arabic', 'system-ui', 'sans-serif']
    }
  },
  
  // Translation namespaces for better organization
  namespaces: ['common', 'navigation', 'forms', 'errors', 'sidebar', 'chat', 'guide', 'recommendations', 'comparison', 'orientations', 'review'],
  
  // Fallback namespace
  defaultNamespace: 'common',
  
  // Local storage key for persisting language preference
  storageKey: 'preferred-locale',
  
  // Cookie settings for SSR
  cookie: {
    name: 'NEXT_LOCALE',
    maxAge: 365 * 24 * 60 * 60 // 1 year
  }
};

/**
 * Check if a locale is RTL
 */
export function isRTL(locale) {
  return i18nConfig.rtlLocales.includes(locale);
}

/**
 * Get locale direction
 */
export function getDirection(locale) {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get locale metadata
 */
export function getLocaleData(locale) {
  return i18nConfig.localeData[locale] || i18nConfig.localeData[i18nConfig.defaultLocale];
}

/**
 * Validate if locale is supported
 */
export function isValidLocale(locale) {
  return i18nConfig.locales.includes(locale);
}
