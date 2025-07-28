# 14. Internationalisation Avancée - Système i18n Bilingue

## 🌍 Vue d'ensemble du Système i18n

**NexieGuide** implémente un système d'internationalisation révolutionnaire optimisé pour l'arabe tunisien et le français. Notre architecture custom supporte la pluralisation grammaticale arabe native, l'interpolation dynamique, et la gestion RTL/LTR automatique - une première dans l'écosystème éducatif maghrébin.

### Innovations Techniques
- **Pluralisation arabe native** selon règles grammaticales traditionnelles
- **Client-side i18n** sans routes localisées (/ar, /fr)
- **Interpolation avancée** variables dynamiques dans traductions
- **Fallback intelligent** détection et récupération erreurs
- **Performance optimisée** lazy loading traductions

## 🏗️ Architecture i18n Custom

### 1. Client i18n Principal

```javascript
// src/app/i18n/client.js - Système complet
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const I18nContext = createContext();

// Configuration langues supportées
export const SUPPORTED_LANGUAGES = {
  ar: {
    name: 'العربية',
    nativeName: 'العربية التونسية',
    direction: 'rtl',
    flag: '🇹🇳',
    region: 'tunisia'
  },
  fr: {
    name: 'Français',
    nativeName: 'Français (Tunisie)',
    direction: 'ltr',
    flag: '🇫🇷',
    region: 'france'
  }
};

export function I18nProvider({ children, initialLocale = 'ar' }) {
  const [language, setLanguage] = useState(initialLocale);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  // Chargement traductions optimisé
  const loadTranslations = useCallback(async (lang) => {
    setLoading(true);
    try {
      // Parallel loading pour performance
      const [common, orientations, interface] = await Promise.all([
        import(`../locales/${lang}/common.json`),
        import(`../locales/${lang}/orientations.json`),
        import(`../locales/${lang}/interface.json`)
      ]);

      setTranslations({
        common: common.default || {},
        orientations: orientations.default || {},
        interface: interface.default || {}
      });
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback vers arabe si erreur
      if (lang !== 'ar') {
        loadTranslations('ar');
        return;
      }
      setTranslations({});
    }
    setLoading(false);
  }, []);

  // Changement langue avec persistance
  const changeLanguage = useCallback((newLang) => {
    if (SUPPORTED_LANGUAGES[newLang]) {
      setLanguage(newLang);
      localStorage.setItem('preferred-language', newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = SUPPORTED_LANGUAGES[newLang].direction;
      loadTranslations(newLang);
    }
  }, [loadTranslations]);

  // Initialisation avec détection browser/storage
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language');
    const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'fr';
    const defaultLang = savedLang || browserLang || 'ar';
    
    changeLanguage(defaultLang);
  }, [changeLanguage]);
```

### 2. Fonction de Traduction Principale

```javascript
  // Traduction basique avec namespace
  const t = useCallback((key, namespace = 'common', fallback = key) => {
    try {
      if (!translations || typeof translations !== 'object') {
        return fallback || key;
      }

      const targetNamespace = translations[namespace] || translations.common || {};
      const keys = key.split('.');
      let value = targetNamespace;

      // Navigation objet imbriqué
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }

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
```

### 3. Pluralisation Arabe Avancée

```javascript
  // Pluralisation selon règles grammaticales arabes
  const pluralize = useCallback((key, count, namespace = 'common', fallback = key) => {
    try {
      if (!translations || typeof translations !== 'object') {
        return fallback || key;
      }

      const targetNamespace = translations[namespace] || translations.common || {};
      
      // Clés pluralisation
      const pluralKey = `${key}_plural`;
      const singularKey = `${key}_singular`;
      const dualKey = `${key}_dual`;
      const zeroKey = `${key}_zero`;
      
      // Règles pluralisation arabe traditionnelles
      if (count === 0) {
        // زِرّوْ - forme zéro (pas d'éléments)
        return targetNamespace[zeroKey] || 
               targetNamespace[pluralKey] || 
               targetNamespace[key] || fallback;
      } else if (count === 1) {
        // مُفْرَد - forme singulier
        return targetNamespace[singularKey] || 
               targetNamespace[key] || fallback;
      } else if (count === 2) {
        // مُثَنَّى - forme duel (spécifique arabe)
        return targetNamespace[dualKey] || 
               targetNamespace[pluralKey] || 
               targetNamespace[key] || fallback;
      } else if (count >= 3 && count <= 10) {
        // جَمْع قِلَّة - pluriel de petit nombre (3-10)
        return targetNamespace[pluralKey] || 
               targetNamespace[key] || fallback;
      } else {
        // جَمْع كَثْرَة - pluriel de grand nombre (11+)
        // En arabe, on revient souvent au singulier pour grands nombres
        return targetNamespace[singularKey] || 
               targetNamespace[key] || fallback;
      }
    } catch (error) {
      console.warn(`Error getting pluralization for '${key}' with count ${count}:`, error);
      return fallback || key;
    }
  }, [translations]);

  // Traduction avancée avec interpolation et pluralisation
  const tAdvanced = useCallback((key, options = {}, namespace = 'common', fallback = key) => {
    try {
      let translation = t(key, namespace, fallback);
      
      // Gestion pluralisation si count fourni
      if (typeof options.count === 'number') {
        translation = pluralize(key, options.count, namespace, fallback);
      }
      
      // Interpolation variables {{variable}}
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
```

## 📁 Structure Fichiers Traductions

### 1. Organisation Modulaire

```
src/i18n/locales/
├── ar/                          # العربية
│   ├── common.json             # مصطلحات عامة
│   ├── orientations.json       # الاختصاصات
│   ├── interface.json          # واجهة المستخدم
│   ├── errors.json             # رسائل الخطأ
│   └── nexie.json             # رسائل نكسي
├── fr/                          # Français
│   ├── common.json             # Termes généraux
│   ├── orientations.json       # Spécialités
│   ├── interface.json          # Interface utilisateur
│   ├── errors.json             # Messages d'erreur
│   └── nexie.json             # Messages Nexie
└── schemas/                     # Validation structure
    ├── common.schema.json
    └── orientations.schema.json
```

### 2. Exemples Traductions Pluralisation

```json
// src/i18n/locales/ar/orientations.json
{
  "choicesCount_zero": "لا توجد اختيارات",
  "choicesCount_singular": "اختيار واحد", 
  "choicesCount_dual": "اختياران",
  "choicesCount_plural": "{{count}} اختيارات",
  
  "universities_zero": "لا توجد جامعات",
  "universities_singular": "جامعة واحدة",
  "universities_dual": "جامعتان", 
  "universities_plural": "{{count}} جامعات",
  
  "studentsEnrolled_zero": "لا يوجد طلاب مسجلون",
  "studentsEnrolled_singular": "طالب واحد مسجل",
  "studentsEnrolled_dual": "طالبان مسجلان",
  "studentsEnrolled_plural": "{{count}} طلاب مسجلون",
  
  "addMoreAnalysis_zero": "أضف اختيارات للحصول على التحليل",
  "addMoreAnalysis_singular": "أضف اختيار واحد للحصول على التحليل", 
  "addMoreAnalysis_dual": "أضف اختيارين للحصول على التحليل",
  "addMoreAnalysis_plural": "أضف {{count}} اختيارات للحصول على التحليل"
}
```

```json
// src/i18n/locales/fr/orientations.json  
{
  "choicesCount_zero": "aucun choix",
  "choicesCount_singular": "{{count}} choix",
  "choicesCount_plural": "{{count}} choix",
  
  "universities_zero": "aucune université", 
  "universities_singular": "{{count}} université",
  "universities_plural": "{{count}} universités",
  
  "studentsEnrolled_zero": "aucun étudiant inscrit",
  "studentsEnrolled_singular": "{{count}} étudiant inscrit", 
  "studentsEnrolled_plural": "{{count}} étudiants inscrits",
  
  "addMoreAnalysis_zero": "Ajoutez des choix pour obtenir l'analyse",
  "addMoreAnalysis_singular": "Ajoutez {{count}} choix pour obtenir l'analyse",
  "addMoreAnalysis_plural": "Ajoutez {{count}} choix pour obtenir l'analyse"
}
```

## 🎯 Utilisation dans Composants

### 1. Hook useTranslation

```javascript
// Utilisation basique
function OrientationCard({ orientation, count }) {
  const { t, tAdvanced, language, changeLanguage } = useTranslation();
  
  return (
    <div className={`card ${language === 'ar' ? 'text-right' : 'text-left'}`}>
      <h3>{t('orientations.title', 'orientations', orientation.name)}</h3>
      
      {/* Pluralisation automatique selon count */}
      <p>{tAdvanced('choicesCount', { count }, 'orientations')}</p>
      
      {/* Interpolation avec variables */}
      <span>{tAdvanced('studentsEnrolled', 
        { count: orientation.enrolledStudents }, 
        'orientations'
      )}</span>
      
      {/* Bouton changement langue */}
      <button onClick={() => changeLanguage(language === 'ar' ? 'fr' : 'ar')}>
        {language === 'ar' ? 'Français' : 'العربية'}
      </button>
    </div>
  );
}
```

### 2. Composant avec Fallbacks Intelligents

```javascript
// Composant avec gestion erreurs traduction
function AnalysisPlaceholder({ selectedChoices }) {
  const { tAdvanced, language } = useTranslation();
  
  const getAnalysisText = useCallback((count) => {
    // Tentative traduction avec pluralisation
    const translatedText = tAdvanced('addMoreAnalysis', { count }, 'orientations');
    
    // Détection si traduction échouée (retourne clé)
    if (translatedText === 'choices.addMoreAnalysis' || 
        translatedText.includes('addMoreAnalysis')) {
      
      // Fallbacks intelligents selon langue
      const fallbacks = {
        ar: {
          0: 'أضف اختيارات للحصول على التحليل',
          1: 'أضف اختيار واحد للحصول على التحليل',  
          2: 'أضف اختيارين للحصول على التحليل',
          plural: `أضف ${count} اختيارات للحصول على التحليل`
        },
        fr: {
          0: 'Ajoutez des choix pour obtenir l\'analyse',
          1: 'Ajoutez 1 choix pour obtenir l\'analyse',
          plural: `Ajoutez ${count} choix pour obtenir l'analyse`
        }
      };
      
      const langFallbacks = fallbacks[language] || fallbacks.ar;
      
      if (count === 0) return langFallbacks[0];
      if (count === 1) return langFallbacks[1]; 
      if (count === 2 && langFallbacks[2]) return langFallbacks[2];
      return langFallbacks.plural;
    }
    
    return translatedText;
  }, [tAdvanced, language]);

  const choiceCount = selectedChoices?.length || 0;
  const analysisText = getAnalysisText(choiceCount);

  return (
    <div className="analysis-placeholder">
      <p>{analysisText}</p>
    </div>
  );
}
```

## 🎨 Styling RTL/LTR Adaptatif

### 1. Classes Tailwind Directionnelles

```css
/* styles/globals.css - Support RTL/LTR */
[dir="rtl"] .text-right { text-align: right; }
[dir="rtl"] .text-left { text-align: left; }
[dir="ltr"] .text-right { text-align: right; }
[dir="ltr"] .text-left { text-align: left; }

/* Marges et padding adaptatifs */
[dir="rtl"] .mr-4 { margin-left: 1rem; margin-right: 0; }
[dir="rtl"] .ml-4 { margin-right: 1rem; margin-left: 0; }
[dir="rtl"] .pl-4 { padding-right: 1rem; padding-left: 0; }
[dir="rtl"] .pr-4 { padding-left: 1rem; padding-right: 0; }

/* Flexbox direction */
[dir="rtl"] .flex-row { flex-direction: row-reverse; }
[dir="rtl"] .flex-row-reverse { flex-direction: row; }

/* Positions flottantes */
[dir="rtl"] .float-left { float: right; }
[dir="rtl"] .float-right { float: left; }

/* Bordures */
[dir="rtl"] .border-l { border-left: none; border-right: 1px solid; }
[dir="rtl"] .border-r { border-right: none; border-left: 1px solid; }
```

### 2. Hook Directionnel

```javascript
// hooks/useDirection.js
import { useTranslation } from '@/app/i18n/client';

export function useDirection() {
  const { language } = useTranslation();
  
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';
  
  // Classes Tailwind adaptatives
  const directionClasses = {
    textAlign: isRTL ? 'text-right' : 'text-left',
    marginStart: isRTL ? 'mr-4' : 'ml-4', 
    marginEnd: isRTL ? 'ml-4' : 'mr-4',
    paddingStart: isRTL ? 'pr-4' : 'pl-4',
    paddingEnd: isRTL ? 'pl-4' : 'pr-4',
    borderStart: isRTL ? 'border-r' : 'border-l',
    borderEnd: isRTL ? 'border-l' : 'border-r'
  };
  
  return {
    direction,
    isRTL,
    isLTR: !isRTL,
    classes: directionClasses
  };
}

// Utilisation dans composants
function DirectionalComponent() {
  const { isRTL, classes } = useDirection();
  
  return (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={classes.marginStart}>Contenu</div>
      <button className={classes.paddingEnd}>Action</button>
    </div>
  );
}
```

## 📊 Validation et Testing

### 1. Schéma Validation Traductions

```javascript
// schemas/translation-validator.js
import Ajv from 'ajv';

const translationSchema = {
  type: 'object',
  required: ['common', 'orientations', 'interface'],
  properties: {
    common: {
      type: 'object',
      properties: {
        welcome: { type: 'string' },
        loading: { type: 'string' },
        error: { type: 'string' }
      }
    },
    orientations: {
      type: 'object',
      patternProperties: {
        '^[a-zA-Z]+(_zero|_singular|_dual|_plural)?$': {
          type: 'string'
        }
      }
    }
  }
};

export function validateTranslations(translations) {
  const ajv = new Ajv();
  const validate = ajv.compile(translationSchema);
  const valid = validate(translations);
  
  if (!valid) {
    console.error('Translation validation errors:', validate.errors);
    return false;
  }
  
  return true;
}
```

### 2. Tests Pluralisation

```javascript
// __tests__/i18n/pluralization.test.js
import { renderHook } from '@testing-library/react';
import { useTranslation } from '@/app/i18n/client';

describe('Arabic Pluralization', () => {
  test('should use correct forms for different counts', () => {
    const { result } = renderHook(() => useTranslation());
    const { tAdvanced } = result.current;
    
    // Test règles pluralisation arabe
    expect(tAdvanced('choices', { count: 0 }, 'orientations'))
      .toBe('لا توجد اختيارات');
    
    expect(tAdvanced('choices', { count: 1 }, 'orientations'))
      .toBe('اختيار واحد');
      
    expect(tAdvanced('choices', { count: 2 }, 'orientations'))
      .toBe('اختياران');
      
    expect(tAdvanced('choices', { count: 5 }, 'orientations'))
      .toBe('5 اختيارات');
      
    expect(tAdvanced('choices', { count: 15 }, 'orientations'))
      .toBe('اختيار واحد'); // Retour singulier pour grands nombres
  });
});
```

## 🚀 Performance et Optimisations

### 1. Lazy Loading Traductions

```javascript
// Chargement à la demande selon navigation
function useDynamicTranslations() {
  const [loadedNamespaces, setLoadedNamespaces] = useState(new Set(['common']));
  
  const loadNamespace = useCallback(async (namespace) => {
    if (loadedNamespaces.has(namespace)) return;
    
    try {
      const translations = await import(`../locales/${language}/${namespace}.json`);
      setTranslations(prev => ({
        ...prev,
        [namespace]: translations.default
      }));
      setLoadedNamespaces(prev => new Set([...prev, namespace]));
    } catch (error) {
      console.warn(`Failed to load namespace ${namespace}`);
    }
  }, [language, loadedNamespaces]);
  
  return { loadNamespace, loadedNamespaces };
}
```

### 2. Cache Traductions

```javascript
// Cache intelligent avec expiration
const translationCache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

function getCachedTranslation(key, language) {
  const cacheKey = `${language}:${key}`;
  const cached = translationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }
  
  return null;
}

function setCachedTranslation(key, language, value) {
  const cacheKey = `${language}:${key}`;
  translationCache.set(cacheKey, {
    value,
    timestamp: Date.now()
  });
}
```

## 🌟 Roadmap i18n Future

### Extensions Prévues 2024-2025

#### Phase 2: Dialectes Régionaux
- **Arabe tunisien** dialectal par région (Tunis, Sfax, Sousse)
- **Berbère/Tamazight** support communautés berbères
- **Détection accent** adaptation vocabulaire selon origine

#### Phase 3: IA Traduction
- **Traduction automatique** contenu dynamique avec IA
- **Contextualisation culturelle** adaptation expressions locales
- **Apprentissage utilisateur** amélioration traductions selon feedback

#### Phase 4: Accessibilité Avancée
- **Synthèse vocale** arabe tunisien naturel
- **Reconnaissance vocale** commandes verbales bilingues
- **Support malvoyants** descriptions audio complètes
