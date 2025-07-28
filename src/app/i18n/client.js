'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { i18nConfig, getDirection, getLocaleData, isValidLocale } from '../../i18n/config';

const I18nContext = createContext();

/**
 * Load translations for a specific locale and namespace
 */
async function loadTranslations(locale, namespace) {
  try {
    const response = await fetch(`/api/translations/${locale}/${namespace}`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${locale}/${namespace}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`Failed to load translations for ${locale}/${namespace}:`, error);
    // Fallback to English if available
    if (locale !== 'en') {
      try {
        const fallbackResponse = await fetch(`/api/translations/en/${namespace}`);
        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
      } catch (fallbackError) {
        console.warn(`Fallback to English also failed for ${namespace}:`, fallbackError);
      }
    }
    return {};
  }
}

/**
 * Load translations from static imports (fallback method)
 */
async function loadStaticTranslations(locale, namespace) {
  try {
    switch (namespace) {
      case 'common':
        const common = await import(`../../i18n/locales/${locale}/common.json`);
        return common.default;
      case 'sidebar':
        const sidebar = await import(`../../i18n/locales/${locale}/sidebar.json`);
        return sidebar.default;
      case 'navigation':
        const navigation = await import(`../../i18n/locales/${locale}/navigation.json`);
        return navigation.default;
      case 'forms':
        const forms = await import(`../../i18n/locales/${locale}/forms.json`);
        return forms.default;
      case 'errors':
        const errors = await import(`../../i18n/locales/${locale}/errors.json`);
        return errors.default;
      case 'chat':
        const chat = await import(`../../i18n/locales/${locale}/chat.json`);
        return chat.default;
      default:
        return {};
    }
  } catch (error) {
    console.warn(`Failed to load static translations for ${locale}/${namespace}:`, error);
    
    // Fallback to English
    if (locale !== 'en') {
      try {
        return await loadStaticTranslations('en', namespace);
      } catch (fallbackError) {
        console.warn(`Fallback to English also failed for ${namespace}:`, fallbackError);
      }
    }
    return {};
  }
}

/**
 * Get stored locale from localStorage
 */
function getStoredLocale() {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(i18nConfig.storageKey);// TEMP FIX: Force English to override any stored Arabic
    if (stored === 'ar') {localStorage.setItem(i18nConfig.storageKey, 'en');
      return 'en';
    }
    return stored;
  } catch (error) {
    console.warn('Failed to read locale from localStorage:', error);
    return null;
  }
}

/**
 * Store locale in localStorage
 */
function storeLocale(locale) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(i18nConfig.storageKey, locale);
  } catch (error) {
    console.warn('Failed to store locale in localStorage:', error);
  }
}

/**
 * Detect user's preferred locale
 */
function detectLocale() {
  // For SSR, always return default to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return i18nConfig.defaultLocale;
  }// Check stored preference first
  const stored = getStoredLocale();if (stored && isValidLocale(stored)) {return stored;
  }
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0];if (isValidLocale(browserLang)) {return browserLang;
  }
  
  // Return defaultreturn i18nConfig.defaultLocale;
}

export function I18nProvider({ children, initialLocale }) {
  // Use initialLocale if provided, otherwise detect on client side only
  const [locale, setLocaleState] = useState(initialLocale || i18nConfig.defaultLocale);
  const [translations, setTranslations] = useState({
    common: {},
    navigation: {},
    forms: {},
    errors: {},
    sidebar: {},
    chat: {}
  });
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(getDirection(locale));
  const [isClientReady, setIsClientReady] = useState(false);

  // Client-side locale detection after hydration
  useEffect(() => {
    if (typeof window !== 'undefined' && !isClientReady) {
      const detectedLocale = detectLocale();
      if (detectedLocale !== locale) {
        setLocaleState(detectedLocale);
        setDirection(getDirection(detectedLocale));
      }
      setIsClientReady(true);
    }
  }, [locale, isClientReady]);

  /**
   * Load all translations for the current locale
   */
  const loadAllTranslations = useCallback(async (targetLocale) => {
    setLoading(true);
    const newTranslations = {};
    
    try {
      // Load all namespaces
      await Promise.all(
        i18nConfig.namespaces.map(async (namespace) => {
          try {
            // Try API first, fallback to static imports
            let namespaceTranslations;
            try {
              namespaceTranslations = await loadTranslations(targetLocale, namespace);
            } catch (error) {
              namespaceTranslations = await loadStaticTranslations(targetLocale, namespace);
            }
            newTranslations[namespace] = namespaceTranslations;
          } catch (error) {
            console.warn(`Failed to load ${namespace} for ${targetLocale}:`, error);
            newTranslations[namespace] = {};
          }
        })
      );
      
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Set fallback translations
      setTranslations({
        common: {},
        navigation: {},
        forms: {},
        errors: {},
        sidebar: {},
        chat: {}
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Change locale
   */
  const changeLocale = useCallback(async (newLocale) => {
    if (!isValidLocale(newLocale) || newLocale === locale) {
      return;
    }
    
    setLocaleState(newLocale);
    setDirection(getDirection(newLocale));
    storeLocale(newLocale);
    
    // Update document direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir = getDirection(newLocale);
      document.documentElement.lang = newLocale;
    }
    
    await loadAllTranslations(newLocale);
  }, [locale, loadAllTranslations]);

  /**
   * Translation function with namespace and fallback support
   */
  const t = useCallback((key, namespace = 'common', fallback = key) => {
    try {
      // Handle case where loading is still in progress or translations not loaded
      if (!translations || typeof translations !== 'object') {
        return fallback || key;
      }

      const keys = key.split('.');
      let value = translations[namespace];
      
      // If namespace doesn't exist, try to fall back to common
      if (!value || typeof value !== 'object') {
        if (namespace !== 'common') {
          console.warn(`Namespace '${namespace}' not found, falling back to common`);
          value = translations.common || {};
        } else {
          // If even common doesn't exist, return fallback
          return fallback || key;
        }
      }
      
      // Navigate through nested keys
      for (const k of keys) {
        if (!value || typeof value !== 'object') {
          break;
        }
        value = value[k];
        if (value === undefined) break;
      }
      
      // Return the found value or fallback
      if (value === undefined || value === null || value === '') {
        if (!loading) {
          console.warn(`Translation key '${key}' not found in namespace '${namespace}'`);
        }
        return fallback || key;
      }
      
      return value;
    } catch (error) {
      console.warn(`Error getting translation for '${key}' in namespace '${namespace}':`, error);
      return fallback || key;
    }
  }, [translations, loading]);

  /**
   * Pluralization function for Arabic
   */
  const pluralize = useCallback((key, count, namespace = 'common', fallback = key) => {
    try {
      if (!translations || typeof translations !== 'object') {
        return fallback || key;
      }

      const targetNamespace = translations[namespace] || translations.common || {};
      
      // Get the pluralization rules for the key
      const pluralKey = `${key}_plural`;
      const singularKey = `${key}_singular`;
      const dualKey = `${key}_dual`;
      
      // Arabic pluralization rules
      if (count === 0) {
        return targetNamespace[`${key}_zero`] || targetNamespace[pluralKey] || targetNamespace[key] || fallback;
      } else if (count === 1) {
        return targetNamespace[singularKey] || targetNamespace[key] || fallback;
      } else if (count === 2) {
        return targetNamespace[dualKey] || targetNamespace[pluralKey] || targetNamespace[key] || fallback;
      } else if (count >= 3 && count <= 10) {
        return targetNamespace[pluralKey] || targetNamespace[key] || fallback;
      } else {
        return targetNamespace[singularKey] || targetNamespace[key] || fallback;
      }
    } catch (error) {
      console.warn(`Error getting pluralization for '${key}' with count ${count}:`, error);
      return fallback || key;
    }
  }, [translations, loading]);

  /**
   * Advanced translation function with interpolation and pluralization
   */
  const tAdvanced = useCallback((key, options = {}, namespace = 'common', fallback = key) => {
    try {
      let translation = t(key, namespace, fallback);
      
      // Handle pluralization if count is provided
      if (typeof options.count === 'number') {
        translation = pluralize(key, options.count, namespace, fallback);
      }
      
      // Handle interpolation
      if (typeof translation === 'string' && options) {
        Object.keys(options).forEach(optionKey => {
          const placeholder = new RegExp(`\\{\\{${optionKey}\\}\\}`, 'g');
          translation = translation.replace(placeholder, options[optionKey]);
        });
      }
      
      return translation;
    } catch (error) {
      console.warn(`Error in advanced translation for '${key}':`, error);
      return fallback || key;
    }
  }, [t, pluralize]);

  /**
   * Initialize translations on mount
   */
  useEffect(() => {
    const initTranslations = async () => {
      try {
        await loadAllTranslations(locale);
      } catch (error) {
        console.error('Failed to load initial translations:', error);
        // Even if loading fails, set loading to false to not block the UI
        setLoading(false);
      }
    };
    
    initTranslations();
  }, []);

  /**
   * Update document direction and language when locale changes
   */
  useEffect(() => {
    if (typeof document !== 'undefined' && isClientReady) {
      document.documentElement.dir = direction;
      document.documentElement.lang = locale;
    }
  }, [direction, locale, isClientReady]);

  const value = {
    locale,
    direction,
    translations,
    loading,
    changeLocale,
    t,
    pluralize,
    tAdvanced,
    localeData: getLocaleData(locale),
    availableLocales: i18nConfig.locales.map(loc => ({
      code: loc,
      ...getLocaleData(loc)
    }))
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

/**
 * Hook for translation with automatic namespace detection
 */
export function useTranslation(namespace = 'common') {
  const { t, pluralize, tAdvanced, locale, loading, changeLocale } = useI18n();
  
  const translate = useCallback((key, fallback) => {
    return t(key, namespace, fallback);
  }, [t, namespace]);

  const translatePlural = useCallback((key, count, fallback) => {
    return pluralize(key, count, namespace, fallback);
  }, [pluralize, namespace]);

  const translateAdvanced = useCallback((key, options, fallback) => {
    return tAdvanced(key, options, namespace, fallback);
  }, [tAdvanced, namespace]);
  
  return {
    t: translate,
    pluralize: translatePlural,
    tAdvanced: translateAdvanced,
    locale,
    loading,
    changeLocale
  };
}
