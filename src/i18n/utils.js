import { i18nConfig, getLocaleData } from './config';

/**
 * Format date based on current locale
 */
export function formatDate(date, locale, options = {}) {
  if (!date) return '';
  
  const localeData = getLocaleData(locale);
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return date; // Return original if invalid date
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    // Fallback to English if locale is not supported
    return new Intl.DateTimeFormat('en', defaultOptions).format(dateObj);
  }
}

/**
 * Format time based on current locale
 */
export function formatTime(date, locale, options = {}) {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return date;
  }
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    return new Intl.DateTimeFormat('en', defaultOptions).format(dateObj);
  }
}

/**
 * Format currency based on current locale
 */
export function formatCurrency(amount, locale, currency = null) {
  if (amount === null || amount === undefined) return '';
  
  const localeData = getLocaleData(locale);
  const currencyCode = currency || localeData.currency || 'USD';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    // Fallback to English
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

/**
 * Format number based on current locale
 */
export function formatNumber(number, locale, options = {}) {
  if (number === null || number === undefined) return '';
  
  try {
    return new Intl.NumberFormat(locale, options).format(number);
  } catch (error) {
    return new Intl.NumberFormat('en', options).format(number);
  }
}

/**
 * Format percentage based on current locale
 */
export function formatPercentage(number, locale, options = {}) {
  if (number === null || number === undefined) return '';
  
  const defaultOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  
  try {
    return new Intl.NumberFormat(locale, defaultOptions).format(number / 100);
  } catch (error) {
    return new Intl.NumberFormat('en', defaultOptions).format(number / 100);
  }
}

/**
 * Get relative time format (e.g., "2 hours ago")
 */
export function formatRelativeTime(date, locale) {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  // Define time units in seconds
  const timeUnits = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ];
  
  for (const { unit, seconds } of timeUnits) {
    const count = Math.floor(diffInSeconds / seconds);
    
    if (count > 0) {
      try {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return rtf.format(-count, unit);
      } catch (error) {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        return rtf.format(-count, unit);
      }
    }
  }
  
  // If less than a second ago
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return rtf.format(0, 'second');
  } catch (error) {
    return 'just now';
  }
}

/**
 * Get list formatter for arrays
 */
export function formatList(items, locale, options = {}) {
  if (!Array.isArray(items) || items.length === 0) return '';
  
  const defaultOptions = {
    style: 'long',
    type: 'conjunction', // 'conjunction' for "and", 'disjunction' for "or"
    ...options
  };
  
  try {
    const listFormatter = new Intl.ListFormat(locale, defaultOptions);
    return listFormatter.format(items);
  } catch (error) {
    const listFormatter = new Intl.ListFormat('en', defaultOptions);
    return listFormatter.format(items);
  }
}

/**
 * Convert numbers to Arabic-Indic numerals for Arabic locale
 */
export function localizeNumbers(text, locale) {
  if (locale !== 'ar' || !text) return text;
  
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const westernNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let localizedText = text.toString();
  
  for (let i = 0; i < westernNumerals.length; i++) {
    localizedText = localizedText.replace(
      new RegExp(westernNumerals[i], 'g'),
      arabicNumerals[i]
    );
  }
  
  return localizedText;
}

/**
 * Parse localized numbers back to western numerals
 */
export function parseLocalizedNumbers(text, locale) {
  if (locale !== 'ar' || !text) return text;
  
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const westernNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let parsedText = text.toString();
  
  for (let i = 0; i < arabicNumerals.length; i++) {
    parsedText = parsedText.replace(
      new RegExp(arabicNumerals[i], 'g'),
      westernNumerals[i]
    );
  }
  
  return parsedText;
}

/**
 * Get text direction helpers
 */
export function getTextAlignment(locale, override = null) {
  if (override) return override;
  return locale === 'ar' ? 'text-right' : 'text-left';
}

export function getFlexDirection(locale, override = null) {
  if (override) return override;
  return locale === 'ar' ? 'flex-row-reverse' : 'flex-row';
}

export function getMarginDirection(locale, side = 'left', override = null) {
  if (override) return override;
  
  if (locale === 'ar') {
    switch (side) {
      case 'left':
        return 'mr';
      case 'right':
        return 'ml';
      default:
        return side;
    }
  }
  
  return side === 'left' ? 'ml' : 'mr';
}
