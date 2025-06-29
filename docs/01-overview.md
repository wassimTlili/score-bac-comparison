# 01. Overview - Vue d'ensemble du projet

## 🎯 Mission

L'application "Comparaison d'Orientations" révolutionne la façon dont les étudiants tunisiens choisissent leur orientation universitaire en utilisant l'intelligence artificielle pour fournir des analyses personnalisées et des conseils adaptés.

## 🚀 Vision

Démocratiser l'accès à un conseil d'orientation de qualité pour tous les étudiants tunisiens, indépendamment de leur localisation géographique ou de leurs ressources financières.

## 👥 Public Cible

### Utilisateurs Principaux
- **Étudiants du baccalauréat tunisien** (17-19 ans)
- Ayant obtenu leur note finale (0-20)
- Hésitant entre deux orientations universitaires
- Cherchant des conseils personnalisés

### Utilisateurs Secondaires
- **Conseillers d'orientation** dans les lycées
- **Parents d'étudiants** souhaitant accompagner leurs enfants
- **Responsables éducatifs** pour comprendre les tendances

## 🎨 Proposition de Valeur

### 1. Analyse IA Personnalisée
- **Intelligence artificielle avancée** (Azure OpenAI GPT-4o)
- **Analyse contextuelle** basée sur le système éducatif tunisien
- **Recommandations adaptées** au score et à la localisation
- **Comparaison objective** entre deux orientations

### 2. Assistant Chat Intelligent
- **Questions de suivi** illimitées après l'analyse
- **Contexte complet** de la comparaison disponible
- **Réponses en temps réel** avec streaming
- **Interface conversationnelle** naturelle

### 3. Données Tunisiennes Authentiques
- **Orientations réelles** du système universitaire tunisien
- **Universités locales** avec leurs spécificités
- **Marché de l'emploi** tunisien pris en compte
- **Gouvernorats** et leurs particularités économiques

## 🔧 Fonctionnalités Clés

### Core Features
1. **Formulaire de Comparaison**
   - Sélection de deux orientations
   - Saisie du score au bac (0-20)
   - Choix du gouvernorat
   - Validation en temps réel

2. **Analyse IA Complète**
   - Forces et défis de chaque orientation
   - Score de compatibilité (0-10)
   - Débouchés professionnels
   - Recommandation finale avec justification

3. **Chat Assistant**
   - Questions libres sur la comparaison
   - Suggestions de questions pertinentes
   - Historique de conversation
   - Réponses contextualisées

4. **Comparaison Universitaire**
   - Universités disponibles par orientation
   - Difficulté d'admission estimée
   - Réputation et infrastructures
   - Localisation géographique

### Features Avancées
- **Insights sur le Score**: Admissibilité et niveau compétitif
- **Insights Géographiques**: Universités locales vs. déménagement
- **Timeline**: Dates importantes et prochaines étapes
- **Partage**: Liens partageables et impression
- **Régénération**: Nouvelle analyse IA à la demande

## 🏗️ Architecture Générale

### Stack Technique
- **Frontend**: Next.js 14 (App Router) + React
- **IA**: Azure OpenAI + Vercel AI SDK
- **Styling**: Tailwind CSS
- **Storage**: En mémoire (évolutif vers DB)
- **Deployment**: Vercel (recommandé)

### Principes de Design
- **Mobile-First**: Interface responsive prioritaire
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimisation Core Web Vitals
- **SEO**: Métadonnées et structure sémantique

## 🎯 Objectifs Business

### Métriques de Succès
1. **Adoption**
   - 1000+ comparaisons générées (3 mois)
   - 500+ utilisateurs uniques (mensuel)
   - 70%+ taux de completion du formulaire

2. **Engagement**
   - 5+ questions de chat par session moyenne
   - 10+ minutes temps passé par session
   - 60%+ utilisateurs revenant consulter leur analyse

3. **Qualité**
   - 4.5/5 satisfaction utilisateur
   - <3 secondes temps de génération IA
   - 99%+ uptime de l'application

### ROI et Valeur
- **Réduction des erreurs d'orientation** de 40%
- **Économie de temps** pour les conseillers
- **Meilleure satisfaction** des nouveaux étudiants
- **Données d'insights** sur les préférences d'orientation

## 🛣️ Roadmap

### Phase 1: MVP (Actuel)
- ✅ Comparaison de base entre 2 orientations
- ✅ Analyse IA avec Azure OpenAI
- ✅ Chat assistant contextuel
- ✅ Interface responsive moderne
- ✅ Données orientations tunisiennes

### Phase 2: Amélioration (2-3 mois)
- 🔄 Base de données persistante
- 🔄 Authentification utilisateur
- 🔄 Historique des comparaisons
- 🔄 Recommandations multi-orientations
- 🔄 Analytics et métriques

### Phase 3: Expansion (6 mois)
- 📋 API publique pour institutions
- 📋 Dashboard pour conseillers
- 📋 Intégration avec plateformes d'admission
- 📋 Application mobile native
- 📋 Support multi-langue (arabe)

### Phase 4: Intelligence (12 mois)
- 📋 Machine learning prédictif
- 📋 Analyse de marché en temps réel
- 📋 Recommandations personnalisées avancées
- 📋 Intégration avec données gouvernementales
- 📋 Système de notation des orientations

## 🎨 Design System

### Couleurs Principales
- **Primaire**: Bleu (#2563EB) - Confiance, éducation
- **Secondaire**: Vert (#059669) - Croissance, opportunité  
- **Accent**: Violet (#7C3AED) - Innovation, IA
- **Warnings**: Orange (#EA580C) - Attention, défis

### Typographie
- **Headlines**: Font weight 600-700
- **Body**: Font weight 400-500  
- **Système**: Inter, system fonts
- **Hiérarchie**: h1(32px) → h2(24px) → h3(20px) → h4(18px)

### Spacing
- **Layout**: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64px)
- **Components**: Consistent padding/margin
- **Grid**: 12 colonnes responsive

## 🔐 Sécurité et Confidentialité

### Protection des Données
- **Aucune donnée personnelle** stockée définitivement
- **Sessions temporaires** avec IDs anonymes
- **Chiffrement** des communications API
- **Conformité GDPR** par design

### Sécurité Technique
- **Variables d'environnement** pour API keys
- **Rate limiting** sur les endpoints IA
- **Validation** stricte des inputs utilisateur
- **Sanitization** des données avant stockage

## 📊 Métriques et Analytics

### Données Collectées (Anonymes)
- Orientations comparées (popularité)
- Distribution des scores utilisateurs
- Gouvernorats d'origine des utilisateurs
- Patterns de questions dans le chat
- Temps de session et engagement

### Outils de Mesure
- Google Analytics 4 (à implémenter)
- Vercel Analytics (performance)
- Custom events pour interactions IA
- Logs applicatifs pour debugging

---

**Prochaine section**: [02. Architecture](./02-architecture.md)
