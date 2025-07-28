// Main i18n exports
export { i18nConfig, isRTL, getDirection, getLocaleData, isValidLocale } from './config';

export { 
  formatDate, 
  formatTime, 
  formatCurrency, 
  formatNumber, 
  formatPercentage, 
  formatRelativeTime, 
  formatList,
  localizeNumbers,
  parseLocalizedNumbers,
  getTextAlignment,
  getFlexDirection,
  getMarginDirection
} from './utils';

export { I18nProvider, useI18n, useTranslation } from '../app/i18n/client';

// Re-export commonly used functions
export { default as DirectionProvider } from '../components/DirectionProvider';
