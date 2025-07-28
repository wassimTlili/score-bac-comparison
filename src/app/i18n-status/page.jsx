'use client';

import { useI18n } from '../i18n/client';

export default function I18nStatusPage() {
  const { locale, direction, loading, translations, availableLocales } = useI18n();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">i18n System Status</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold">Current Status:</h2>
          <p>Locale: {locale}</p>
          <p>Direction: {direction}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Translations loaded: {translations ? Object.keys(translations).length : 0} namespaces</p>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold">Available Locales:</h2>
          <ul>
            {availableLocales?.map(loc => (
              <li key={loc.code}>{loc.flag} {loc.nativeName} ({loc.code})</li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold">Loaded Namespaces:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(translations ? Object.keys(translations) : {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
