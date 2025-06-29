# 03. AI Integration - Intégration de l'IA (Azure OpenAI)

## 🤖 Vue d'ensemble de l'intégration IA

L'application utilise Azure OpenAI avec le modèle GPT-4o pour fournir des analyses personnalisées et des réponses de chat contextuelles. L'intégration suit les meilleures pratiques avec le Vercel AI SDK.

## 🔧 Configuration Azure OpenAI

### Setup Initial

```javascript
// src/lib/azure-ai.js
import { AzureOpenAI } from '@azure/openai';

export const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: "2024-02-15-preview",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME
});
```

### Variables d'Environnement Requises

```bash
# .env.local
AZURE_OPENAI_API_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Vercel AI SDK Integration

```javascript
// Utilisation avec Vercel AI SDK
import { openai } from 'ai';

const model = openai(client); // Wrap Azure client
```

## 🎯 Génération de Comparaisons IA

### 1. Structured Generation avec generateObject

```javascript
// src/actions/ai-comparison.js
import { generateObject } from 'ai';
import { z } from 'zod';

const ComparisonAnalysisSchema = z.object({
  overview: z.string(),
  orientation1Analysis: z.object({
    strengths: z.array(z.string()),
    challenges: z.array(z.string()),
    suitabilityScore: z.number().min(0).max(10),
    careerProspects: z.array(z.string())
  }),
  orientation2Analysis: z.object({
    strengths: z.array(z.string()),
    challenges: z.array(z.string()),
    suitabilityScore: z.number().min(0).max(10),
    careerProspects: z.array(z.string())
  }),
  recommendation: z.object({
    preferred: z.string(),
    reasoning: z.string(),
    actionSteps: z.array(z.string())
  }),
  universitiesComparison: z.array(z.object({
    orientation: z.string(),
    university: z.string(),
    location: z.string(),
    admissionDifficulty: z.enum(['facile', 'moyenne', 'difficile']),
    reputation: z.enum(['excellente', 'bonne', 'moyenne']),
    facilities: z.string()
  }))
});

export async function generateComparison(orientation1, orientation2, userProfile) {
  const prompt = createComparisonPrompt(orientation1, orientation2, userProfile);
  
  const result = await generateObject({
    model: client,
    schema: ComparisonAnalysisSchema,
    prompt: prompt,
    temperature: 0.7,
    maxTokens: 2000
  });

  return {
    success: true,
    data: {
      ...result.object,
      generatedAt: new Date(),
      modelUsed: 'gpt-4o'
    }
  };
}
```

### 2. Prompt Engineering

```javascript
// src/lib/prompts.js
export function createComparisonPrompt(orientation1, orientation2, userProfile) {
  return `
Tu es un conseiller d'orientation expert spécialisé dans le système éducatif tunisien.

CONTEXTE ÉTUDIANT:
- Score au bac: ${userProfile.score}/20
- Localisation: ${userProfile.location}
- Date: ${new Date().toLocaleDateString('fr-TN')}

ORIENTATION 1: ${orientation1.name}
- Catégorie: ${orientation1.category}
- Description: ${orientation1.description}
- Score minimum requis: ${orientation1.requirements.minScore}/20
- Matières importantes: ${orientation1.requirements.subjects.join(', ')}
- Débouchés: ${orientation1.opportunities.join(', ')}
- Universités: ${orientation1.universities.map(u => 
    `${u.name} (${u.location}, min: ${u.minScore}/20)`
  ).join(', ')}
- Marché emploi: ${orientation1.jobMarket.demandLevel} demande, 
  ${orientation1.jobMarket.averageSalary}, croissance ${orientation1.jobMarket.growth}

ORIENTATION 2: ${orientation2.name}
- [Structure identique]

INSTRUCTIONS:
1. Analyse chaque orientation selon le profil de l'étudiant
2. Considère l'admissibilité basée sur le score
3. Évalue l'accessibilité géographique depuis ${userProfile.location}
4. Compare les débouchés dans le contexte tunisien
5. Fournis une recommandation justifiée et actionnable

Réponds en JSON structuré selon le schéma fourni.
`;
}
```

### 3. Fallback Strategy

```javascript
// Analyse de secours en cas d'échec IA
function createFallbackAnalysis(orientation1, orientation2, userProfile) {
  return {
    overview: `Comparaison entre ${orientation1.name} et ${orientation2.name} 
               pour un étudiant avec ${userProfile.score}/20 à ${userProfile.location}.`,
    
    orientation1Analysis: {
      strengths: [`Domaine: ${orientation1.category}`, "Formation reconnue"],
      challenges: ["Compétition à l'admission", "Exigences académiques"],
      suitabilityScore: userProfile.score >= orientation1.requirements.minScore ? 7 : 4,
      careerProspects: orientation1.opportunities.slice(0, 3)
    },
    
    // ... structure similaire pour orientation2
    
    recommendation: {
      preferred: determineBestChoice(orientation1, orientation2, userProfile),
      reasoning: "Recommandation basée sur l'admissibilité et les débouchés",
      actionSteps: [
        "Vérifier les prérequis détaillés",
        "Préparer le dossier d'inscription",
        "Consulter un conseiller d'orientation"
      ]
    },
    
    isFallback: true,
    generatedAt: new Date()
  };
}
```

## 💬 Chat Assistant IA

### 1. Streaming Chat avec streamText

```javascript
// src/app/api/chat/route.js
import { streamText } from 'ai';

export async function POST(request) {
  const { messages, comparisonId } = await request.json();
  
  // Récupérer le contexte de comparaison
  const comparison = await getComparison(comparisonId);
  const context = createChatbotContext(comparison);

  const result = await streamText({
    model: client,
    system: `${CHATBOT_SYSTEM_PROMPT}\n\n${context}`,
    messages,
    temperature: 0.7,
    maxTokens: 1000,
  });

  return result.toAIStreamResponse();
}
```

### 2. Context Injection

```javascript
// Injection du contexte de comparaison
export function createChatbotContext(comparison) {
  return `
CONTEXTE DE LA COMPARAISON:

PROFIL ÉTUDIANT:
- Score: ${comparison.userProfile.score}/20
- Localisation: ${comparison.userProfile.location}

ORIENTATIONS COMPARÉES:
1. ${comparison.orientation1.name} (${comparison.orientation1.category})
2. ${comparison.orientation2.name} (${comparison.orientation2.category})

ANALYSE IA DISPONIBLE:
${JSON.stringify(comparison.aiAnalysis, null, 2)}

INSTRUCTIONS:
- Utilise ces informations pour répondre aux questions
- Sois spécifique au contexte tunisien
- Référence l'analyse existante quand pertinent
- Fournis des conseils pratiques et actionables
`;
}
```

### 3. Client-Side Chat Integration

```javascript
// src/components/ChatBot.jsx
import { useChat } from 'ai/react';

export default function ChatBot({ comparison }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      comparisonId: comparison.id
    },
    initialMessages: [{
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ! Je suis votre assistant pour cette comparaison 
                entre ${comparison.orientation1.name} et ${comparison.orientation2.name}.
                
                Que souhaitez-vous savoir ?`
    }]
  });

  // ... UI rendering
}
```

## 🎨 Prompt Engineering Avancé

### 1. System Prompts Spécialisés

```javascript
// Prompt pour comparaison d'orientations
export const COMPARISON_SYSTEM_PROMPT = `
Tu es un conseiller d'orientation expert spécialisé dans le système éducatif tunisien.

EXPERTISE:
- Connaissance approfondie du baccalauréat tunisien (notation 0-20)
- Maîtrise des universités publiques et privées tunisiennes
- Compréhension du marché de l'emploi local
- Sensibilité aux spécificités régionales (gouvernorats)

MÉTHODOLOGIE:
1. Analyser l'admissibilité objective (score vs prérequis)
2. Évaluer la faisabilité géographique
3. Comparer les débouchés dans le contexte économique tunisien
4. Considérer les aspects financiers et familiaux
5. Formuler des recommandations concrètes et réalisables

STYLE:
- Objectif mais encourageant
- Spécifique au contexte tunisien
- Langage clair et accessible
- Focus sur l'actionnable
`;

// Prompt pour chat assistant
export const CHATBOT_SYSTEM_PROMPT = `
Tu es un assistant IA spécialisé dans l'orientation universitaire tunisienne.

RÔLE:
- Répondre aux questions de suivi sur la comparaison
- Fournir des détails complémentaires
- Donner des conseils personnalisés
- Aider à la prise de décision

CONTEXTE DISPONIBLE:
- Analyse complète de comparaison IA
- Profil détaillé de l'étudiant
- Données des orientations et universités

DIRECTIVES:
- Utilise TOUJOURS les données de l'analyse existante
- Reste dans le contexte tunisien
- Sois concret et spécifique
- Évite les généralités
- Propose des actions concrètes
`;
```

### 2. Templates de Prompts Dynamiques

```javascript
// Templates pour différents types de questions
export const PROMPT_TEMPLATES = {
  admission: (orientation, score, location) => `
Analyse détaillée des chances d'admission en ${orientation} 
avec un score de ${score}/20 depuis ${location}.
Inclus: universités recommandées, stratégies d'inscription, 
délais importants, alternatives en cas de refus.
`,

  career: (orientation) => `
Débouchés professionnels pour ${orientation} en Tunisie:
- Secteurs qui recrutent actuellement
- Fourchettes de salaires (débutant → expérimenté)
- Perspectives d'évolution de carrière
- Opportunités d'entrepreneuriat
- Marché de l'emploi régional vs national
`,

  preparation: (orientation, currentLevel) => `
Plan de préparation pour réussir en ${orientation}:
- Compétences clés à développer avant l'université
- Ressources d'apprentissage recommandées
- Stages ou expériences pratiques valorisantes
- Réseau professionnel à construire
- Timeline de préparation optimale
`
};
```

### 3. Validation et Enhancement

```javascript
// Validation des inputs avant envoi à l'IA
export function validateComparisonInput(orientation1, orientation2, userProfile) {
  const errors = [];

  // Validation des orientations
  if (!orientation1?.name || !orientation2?.name) {
    errors.push('Orientations incomplètes');
  }

  if (orientation1.id === orientation2.id) {
    errors.push('Orientations identiques non autorisées');
  }

  // Validation du profil utilisateur
  if (userProfile.score < 0 || userProfile.score > 20) {
    errors.push('Score invalide (doit être entre 0 et 20)');
  }

  // Validation de la localisation
  const validGovernorates = getAllGovernorates();
  if (!validGovernorates.includes(userProfile.location)) {
    errors.push('Gouvernorat invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Enhancement avec données contextuelles
export function enhanceAnalysis(basicAnalysis, orientation1, orientation2, userProfile) {
  return {
    ...basicAnalysis,
    
    scoreInsights: {
      canApplyTo1: userProfile.score >= orientation1.requirements.minScore,
      canApplyTo2: userProfile.score >= orientation2.requirements.minScore,
      competitiveLevel: getCompetitiveLevel(userProfile.score),
      improvementNeeded: calculateImprovementNeeded(userProfile.score, orientation1, orientation2)
    },
    
    locationInsights: {
      localUniversities: findLocalUniversities(userProfile.location, [orientation1, orientation2]),
      distanceToUniversities: calculateDistances(userProfile.location, [orientation1, orientation2]),
      regionalJobMarket: getRegionalJobMarket(userProfile.location)
    },
    
    timelineInsights: {
      urgency: determineUrgency(),
      nextDeadlines: getUpcomingDeadlines(),
      preparationTime: calculatePreparationTime()
    }
  };
}
```

## 📊 Monitoring et Optimisation IA

### 1. Métriques de Performance

```javascript
// Tracking des performances IA
const aiMetrics = {
  responseTime: Date.now() - startTime,
  tokenUsage: {
    prompt: result.usage?.promptTokens || 0,
    completion: result.usage?.completionTokens || 0,
    total: result.usage?.totalTokens || 0
  },
  model: 'gpt-4o',
  success: !error,
  fallbackUsed: false
};

// AI metrics are tracked internally for monitoring
// No logging to console in production
```

### 2. Rate Limiting et Quotas

```javascript
// Protection contre les abus
const RATE_LIMITS = {
  comparisons: {
    perUser: 5, // par jour
    perIP: 20   // par heure
  },
  chat: {
    perUser: 50,  // messages par jour
    perSession: 20 // messages par session
  }
};

// Implémentation avec Redis (futur)
async function checkRateLimit(userId, action) {
  const key = `rate_limit:${action}:${userId}`;
  const current = await redis.get(key);
  
  if (current >= RATE_LIMITS[action].perUser) {
    throw new Error('Rate limit exceeded');
  }
  
  await redis.incr(key);
  await redis.expire(key, 86400); // 24h
}
```

### 3. Optimisation des Coûts

```javascript
// Stratégies d'optimisation des coûts
const OPTIMIZATION_STRATEGIES = {
  // Cache des analyses similaires
  caching: {
    enabled: true,
    ttl: 3600, // 1 heure
    keyGenerator: (o1, o2, profile) => 
      `${o1.id}-${o2.id}-${Math.floor(profile.score)}-${profile.location}`
  },
  
  // Compression des prompts
  promptOptimization: {
    removeRedundancy: true,
    abbreviateDescriptions: true,
    limitUniversityList: 5
  },
  
  // Modèles adaptatifs
  modelSelection: {
    simple: 'gpt-3.5-turbo', // Pour questions simples
    complex: 'gpt-4o',       // Pour analyses complètes
    threshold: 'auto'        // Détection automatique
  }
};
```

## 🔒 Sécurité IA

### 1. Input Sanitization

```javascript
// Nettoyage des inputs utilisateur
export function sanitizeUserInput(input) {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Supprime HTML/JS
    .substring(0, 500); // Limite la longueur
}

// Validation des prompts
export function validatePrompt(prompt) {
  const forbidden = ['system:', 'assistant:', 'ignore previous'];
  return !forbidden.some(term => 
    prompt.toLowerCase().includes(term)
  );
}
```

### 2. Output Filtering

```javascript
// Filtrage des réponses IA
export function filterAIResponse(response) {
  // Supprime les informations sensibles
  const filtered = response
    .replace(/API_KEY|PASSWORD|SECRET/gi, '[REDACTED]')
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD_NUMBER]');
  
  return filtered;
}
```

---

**Section précédente**: [02. Architecture](./02-architecture.md)  
**Prochaine section**: [04. Data Models](./04-data-models.md)
