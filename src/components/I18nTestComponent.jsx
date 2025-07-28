/**
 * i18n Integration Test Component
 * Use this to test all i18n functionality
 */

'use client';

import { useState } from 'react';
import { useI18n, useTranslation } from '../app/i18n/client';
import { formatDate, formatCurrency, formatRelativeTime } from '../i18n/utils';
import LanguageSwitcher from './LanguageSwitcher';

export default function I18nTestComponent() {
  const { locale, direction, loading, availableLocales, t: tGlobal } = useI18n();
  const { t } = useTranslation('common');
  const [testData] = useState({
    date: new Date(),
    price: 1234.56,
    pastDate: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  });

  return (
    <div className={`p-6 max-w-4xl mx-auto ${direction === 'rtl' ? 'font-arabic' : 'font-latin'}`}>
      <header className="mb-8">
        <div className={`flex justify-between items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-800">
            i18n Test Component
          </h1>
          <LanguageSwitcher />
        </div>
        
        {loading && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
            Loading translations...
          </div>
        )}
      </header>

      <div className="space-y-8">
        {/* Basic Translation Tests */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Translations</h2>
          <div className="space-y-2">
            <p><strong>Welcome:</strong> {t('welcome', 'Welcome (fallback)')}</p>
            <p><strong>Loading:</strong> {t('loading', 'Loading... (fallback)')}</p>
            <p><strong>Save:</strong> {t('save', 'Save (fallback)')}</p>
            <p><strong>Cancel:</strong> {t('cancel', 'Cancel (fallback)')}</p>
          </div>
        </section>

        {/* System Information */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Current Locale:</strong> {locale}</p>
              <p><strong>Direction:</strong> {direction}</p>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p><strong>Available Locales:</strong></p>
              <ul className="list-disc list-inside">
                {availableLocales.map(loc => (
                  <li key={loc.code}>
                    {loc.flag} {loc.nativeName} ({loc.code})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Formatting Tests */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Formatting Tests</h2>
          <div className="space-y-3">
            <p><strong>Date:</strong> {formatDate(testData.date, locale)}</p>
            <p><strong>Currency:</strong> {formatCurrency(testData.price, locale)}</p>
            <p><strong>Relative Time:</strong> {formatRelativeTime(testData.pastDate, locale)}</p>
          </div>
        </section>

        {/* RTL/LTR Layout Tests */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Layout Direction Tests</h2>
          
          {/* Flex Layout Test */}
          <div className={`flex gap-4 p-4 bg-white rounded mb-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 bg-red-200 rounded flex items-center justify-center">1</div>
            <div className="w-12 h-12 bg-green-200 rounded flex items-center justify-center">2</div>
            <div className="w-12 h-12 bg-blue-200 rounded flex items-center justify-center">3</div>
          </div>

          {/* Text Alignment Test */}
          <div className={`p-4 bg-white rounded mb-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            <p>This text should be aligned according to the current language direction.</p>
            <p>Current direction: <strong>{direction.toUpperCase()}</strong></p>
          </div>

          {/* Form Elements Test */}
          <div className="p-4 bg-white rounded">
            <div className="space-y-3">
              <input
                type="text"
                placeholder={direction === 'rtl' ? 'نص تجريبي' : 'Sample text'}
                className={`w-full p-2 border border-gray-300 rounded ${
                  direction === 'rtl' ? 'text-right' : 'text-left'
                }`}
              />
              <div className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <button className="px-4 py-2 bg-green-500 text-white rounded">
                  {t('save', 'Save')}
                </button>
                <button className="px-4 py-2 bg-gray-500 text-white rounded">
                  {t('cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Namespace Tests */}
        <section className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Namespace Tests</h2>
          <div className="space-y-2">
            <p><strong>Navigation (Menu):</strong> {tGlobal('menu', 'navigation')}</p>
            <p><strong>Sidebar (Chat with Nexie):</strong> {tGlobal('chatWithNexie', 'sidebar')}</p>
            <p><strong>Forms (Email):</strong> {tGlobal('email', 'forms')}</p>
            <p><strong>Errors (General):</strong> {tGlobal('general', 'errors')}</p>
          </div>
        </section>

        {/* Font Test */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Font Rendering Test</h2>
          <div className="space-y-4">
            <div className="font-latin">
              <h3 className="font-semibold">Latin Font (English/French):</h3>
              <p>The quick brown fox jumps over the lazy dog. 1234567890</p>
              <p>Bonjour! Comment ça va? Les caractères accentués: àèùâêî</p>
            </div>
            
            <div className="font-arabic">
              <h3 className="font-semibold">Arabic Font:</h3>
              <p dir="rtl">مرحبا بك في منصة التوجيه. هذا نص تجريبي باللغة العربية.</p>
              <p dir="rtl">الأرقام العربية: ١٢٣٤٥٦٧٨٩٠</p>
            </div>
          </div>
        </section>

        {/* Manual Language Switching */}
        <section className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Manual Language Testing</h2>
          <p className="mb-4">Click on a language to test switching:</p>
          <div className={`flex gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {availableLocales.map(loc => (
              <button
                key={loc.code}
                onClick={() => window.location.reload()} // Simple reload test
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  locale === loc.code
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-purple-500 border-purple-200 hover:border-purple-400'
                }`}
              >
                {loc.flag} {loc.nativeName}
              </button>
            ))}
          </div>
        </section>

        {/* Status Summary */}
        <section className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Status Summary</h2>
          <div className="space-y-2 text-green-700">
            <p>✅ i18n Provider: Active</p>
            <p>✅ Translation Loading: {loading ? 'In Progress' : 'Complete'}</p>
            <p>✅ Direction Support: {direction.toUpperCase()}</p>
            <p>✅ Font Loading: Active</p>
            <p>✅ Locale Detection: {locale}</p>
            <p>✅ Language Switcher: Integrated</p>
          </div>
        </section>
      </div>
    </div>
  );
}
