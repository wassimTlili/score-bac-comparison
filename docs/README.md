# Documentation - Comparaison d'Orientations

Bienvenue dans la documentation complète de l'application de comparaison d'orientations universitaires tunisiennes.

## 📋 Table des Matières

1. [Overview](./01-overview.md) - Vue d'ensemble du projet
2. [Architecture](./02-architecture.md) - Architecture technique détaillée
3. [AI Integration](./03-ai-integration.md) - Intégration de l'IA (Azure OpenAI)
4. [Data Models](./04-data-models.md) - Modèles de données et schémas
5. [Server Actions](./05-server-actions.md) - Actions serveur et logique métier
6. [Components](./06-components.md) - Composants React et UI
7. [API Routes](./07-api-routes.md) - Routes API et endpoints
8. [Storage & Database](./08-storage-database.md) - Stockage et base de données
9. [User Experience](./09-user-experience.md) - Parcours utilisateur et UX
10. [Deployment & DevOps](./10-deployment-devops.md) - Déploiement et DevOps
11. [Testing Strategy](./11-testing.md) - Stratégie de tests
12. [Contributing Guide](./12-contributing.md) - Guide de contribution

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env.local
# Editez .env.local avec vos clés Azure OpenAI

# Développement
npm run dev

# Build de production
npm run build
npm start
```

## 🎯 Objectif du Projet

Cette application aide les étudiants tunisiens du baccalauréat à:
- Comparer deux orientations universitaires avec l'IA
- Obtenir des analyses personnalisées basées sur leur score et localisation
- Poser des questions de suivi via un chatbot intelligent
- Prendre des décisions éclairées pour leur avenir académique

## 🏗️ Architecture Technique

- **Framework**: Next.js 14 (App Router)
- **IA**: Azure OpenAI (GPT-4o) avec Vercel AI SDK
- **Stockage**: En mémoire (extensible vers base de données)
- **UI**: Tailwind CSS avec composants React
- **Actions**: Server Actions pour la logique métier

## 📱 Fonctionnalités Principales

### Comparaison IA
- Analyse personnalisée de deux orientations
- Prise en compte du score au bac (0-20)
- Adaptation selon le gouvernorat tunisien
- Recommandations et étapes d'action

### Chat Assistant
- Questions de suivi sur la comparaison
- Contexte complet de l'analyse IA
- Réponses en streaming en temps réel
- Interface intuitive avec suggestions

### Interface Moderne
- Design responsive et accessible
- Split layout pour analyse + chat
- Indicateurs visuels de compatibilité
- Fonctions de partage et impression

## 🔧 Configuration Requise

- Node.js 18+
- Azure OpenAI API key
- Next.js 14+
- Variables d'environnement configurées

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🤝 Support

Pour toute question ou problème:
1. Consultez la documentation détaillée
2. Vérifiez les [issues GitHub](../../issues)
3. Créez une nouvelle issue si nécessaire

## 📝 Changelog

### Version 2024.12 - Production Cleanup
**Completed December 2024**

#### Removed Features
- ❌ **ComparisonActionButtons component** - Removed "Partager" and "Imprimer" buttons as they were unnecessary for the core user experience
- ❌ **Debug console.log statements** - Cleaned up all debugging console.log statements throughout the codebase for production readiness

#### Improvements  
- ✅ **Cleaner UI** - Simplified comparison page without extraneous action buttons
- ✅ **Production-ready code** - Removed all development/debugging artifacts
- ✅ **Documentation updates** - Updated docs to reflect current implementation
- ✅ **Better user focus** - Interface now focuses on core functionality: analysis and chat assistant

#### Technical Changes
- Updated `src/app/comparison/[id]/page.jsx` to remove action buttons
- Cleaned up console.log statements across:
  - `src/lib/azure-ai.js`
  - `src/lib/comparison-storage.js` 
  - `src/actions/ai-comparison.js`
  - `src/actions/comparison-actions.js`
  - `src/app/api/chat/route.js`
  - `src/components/OrientationForm.jsx`
- Updated documentation examples to remove debugging code

---

**Dernière mise à jour**: ${new Date().toLocaleDateString('fr-TN')}
**Version**: 1.0.0
