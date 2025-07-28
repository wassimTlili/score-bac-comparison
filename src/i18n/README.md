# i18n Implementation Guide

## Overview

This comprehensive i18n (internationalization) system supports **English (en)**, **French (fr)**, and **Arabic (ar)** with full RTL/LTR direction handling, automatic locale detection, and seamless language switching.

## Features

✅ **Multi-language Support**: English, French, Arabic  
✅ **RTL/LTR Direction**: Automatic direction switching  
✅ **Locale Detection**: Browser preference + manual selection  
✅ **Persistent Storage**: localStorage + cookies  
✅ **Dynamic Loading**: Lazy-loaded translation files  
✅ **Fallback System**: Always fallback to English  
✅ **TypeScript Ready**: Full type safety  
✅ **Performance Optimized**: Namespace-based loading  
✅ **Developer Friendly**: Comprehensive error handling  

## Quick Start

### 1. Wrap Your App

```jsx
// app/layout.js
import { I18nProvider } from '../app/i18n/client';
import DirectionProvider from '../components/DirectionProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider>
          <DirectionProvider>
            {children}
          </DirectionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
```

### 2. Use Translations in Components

```jsx
// Basic usage
import { useTranslation } from '../app/i18n/client';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('description', 'Default fallback text')}</p>
    </div>
  );
}
```

```jsx
// Advanced usage with multiple namespaces
import { useI18n } from '../app/i18n/client';

function AdvancedComponent() {
  const { t, locale, changeLocale, loading } = useI18n();
  
  return (
    <div>
      <h1>{t('forms.name')}</h1>
      <p>{t('errors.general')}</p>
      <button onClick={() => changeLocale('ar')}>
        Switch to Arabic
      </button>
      {loading && <span>Loading...</span>}
    </div>
  );
}
```

### 3. Add Language Switcher

```jsx
// Already integrated in Navbar.jsx
import LanguageSwitcher from '../components/LanguageSwitcher';

function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

## Translation Files Structure

```
src/i18n/locales/
├── en/
│   ├── common.json      # Common UI elements
│   ├── navigation.json  # Navigation-related
│   ├── sidebar.json     # Sidebar-specific
│   ├── forms.json       # Form labels/validation
│   └── errors.json      # Error messages
├── fr/
│   └── ... (same structure)
└── ar/
    └── ... (same structure)
```

### Adding New Translations

```json
// src/i18n/locales/en/common.json
{
  "welcome": "Welcome",
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

```jsx
// Using nested translations
const { t } = useTranslation('common');
console.log(t('buttons.save')); // "Save"
```

## RTL/LTR Direction Handling

### Automatic Direction

The system automatically detects language direction:
- **Arabic (ar)**: RTL (Right-to-Left)
- **English (en), French (fr)**: LTR (Left-to-Right)

### CSS Classes Available

```css
/* Automatically applied based on locale */
.rtl { direction: rtl; }
.ltr { direction: ltr; }

/* Font families */
.font-arabic { font-family: 'Cairo', 'Noto Sans Arabic', system-ui; }
.font-latin { font-family: 'Inter', system-ui; }

/* RTL-aware utilities */
.rtl .ml-auto { margin-left: unset; margin-right: auto; }
.rtl .text-left { text-align: right; }
.rtl .flex-row { flex-direction: row-reverse; }
```

### Manual Direction Control

```jsx
import { useI18n } from '../app/i18n/client';
import { getTextAlignment } from '../i18n/utils';

function MyComponent() {
  const { locale, direction } = useI18n();
  
  return (
    <div 
      className={`${direction === 'rtl' ? 'text-right' : 'text-left'}`}
      dir={direction}
    >
      <p className={getTextAlignment(locale)}>
        Content that adapts to direction
      </p>
    </div>
  );
}
```

## Utility Functions

### Date/Time Formatting

```jsx
import { formatDate, formatTime, formatRelativeTime } from '../i18n/utils';
import { useI18n } from '../app/i18n/client';

function DateComponent() {
  const { locale } = useI18n();
  const date = new Date();
  
  return (
    <div>
      <p>{formatDate(date, locale)}</p>
      <p>{formatTime(date, locale)}</p>
      <p>{formatRelativeTime(date, locale)}</p>
    </div>
  );
}
```

### Number/Currency Formatting

```jsx
import { formatNumber, formatCurrency } from '../i18n/utils';

function PriceComponent({ amount }) {
  const { locale } = useI18n();
  
  return (
    <div>
      <span>{formatCurrency(amount, locale)}</span>
      <span>{formatNumber(amount, locale)}</span>
    </div>
  );
}
```

## API Routes

Translation files are served via API routes for dynamic loading:

```
GET /api/translations/[locale]/[namespace]
```

Example:
- `/api/translations/en/common`
- `/api/translations/ar/sidebar`

## Configuration

### Adding New Languages

1. **Update config**:
```js
// src/i18n/config.js
export const i18nConfig = {
  locales: ['en', 'fr', 'ar', 'es'], // Add Spanish
  // ... rest of config
  localeData: {
    es: {
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      direction: 'ltr'
    }
  }
};
```

2. **Create translation files**:
```
src/i18n/locales/es/
├── common.json
├── navigation.json
└── ... (other namespaces)
```

### Adding New Namespaces

1. **Update config**:
```js
export const i18nConfig = {
  namespaces: ['common', 'navigation', 'forms', 'errors', 'dashboard'], // Add dashboard
};
```

2. **Create files**:
```
src/i18n/locales/
├── en/dashboard.json
├── fr/dashboard.json
└── ar/dashboard.json
```

3. **Update static loader**:
```js
// src/app/i18n/client.js
async function loadStaticTranslations(locale, namespace) {
  switch (namespace) {
    case 'dashboard':
      const dashboard = await import(`../../i18n/locales/${locale}/dashboard.json`);
      return dashboard.default;
    // ... other cases
  }
}
```

## Best Practices

### 1. Translation Keys

Use descriptive, nested keys:
```json
{
  "auth": {
    "login": {
      "title": "Sign In",
      "button": "Login",
      "forgotPassword": "Forgot Password?"
    }
  }
}
```

### 2. Fallback Handling

Always provide fallbacks:
```jsx
const { t } = useTranslation('common');
return <h1>{t('title', 'Default Title')}</h1>;
```

### 3. RTL-Aware Components

Consider direction in component design:
```jsx
function IconButton({ icon, text, locale }) {
  return (
    <button className={`flex items-center ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
      {icon}
      <span className={locale === 'ar' ? 'mr-2' : 'ml-2'}>{text}</span>
    </button>
  );
}
```

### 4. Performance

- Use namespace-specific translations
- Lazy load translation files
- Cache translations in localStorage

## Troubleshooting

### Common Issues

1. **Translations not loading**:
   - Check if translation files exist
   - Verify namespace is configured
   - Check browser console for errors

2. **RTL styling issues**:
   - Ensure `DirectionProvider` wraps your app
   - Use logical CSS properties (`margin-inline-start` vs `margin-left`)
   - Test thoroughly in RTL mode

3. **Font rendering (Arabic)**:
   - Ensure Cairo font is loaded
   - Check font fallbacks in CSS
   - Verify font-feature-settings for Arabic

### Debug Mode

Enable verbose logging:
```jsx
// Set in development
if (process.env.NODE_ENV === 'development') {
  console.log('Current locale:', locale);
  console.log('Available translations:', translations);
}
```

## Examples

### Complete Component Example

```jsx
'use client';

import { useTranslation } from '../app/i18n/client';
import { formatDate } from '../i18n/utils';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ExampleComponent() {
  const { t, locale, changeLocale } = useTranslation('common');
  
  return (
    <div className={`p-4 ${locale === 'ar' ? 'text-right font-arabic' : 'text-left font-latin'}`}>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('welcome')}</h1>
        <LanguageSwitcher />
      </header>
      
      <main>
        <p>{t('description', 'Welcome to our platform!')}</p>
        <p>Current date: {formatDate(new Date(), locale)}</p>
        
        <div className={`mt-4 flex gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => changeLocale('en')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            English
          </button>
          <button 
            onClick={() => changeLocale('fr')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Français
          </button>
          <button 
            onClick={() => changeLocale('ar')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            العربية
          </button>
        </div>
      </main>
    </div>
  );
}
```

## Resources

- [React i18n Best Practices](https://react.i18next.com/)
- [Next.js Internationalization](https://nextjs.org/docs/advanced-features/i18n)
- [RTL CSS Guidelines](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Writing_Modes)
- [Arabic Typography](https://fonts.google.com/?subset=arabic)

---

**Note**: This implementation is production-ready and follows modern i18n best practices. All components are thoroughly tested for RTL/LTR compatibility.
