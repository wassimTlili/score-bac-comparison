# 03. AI Integration - Intégration IA Avancée (Azure OpenAI + Nexie Assistant)

## 🤖 Vue d'ensemble de l'intégration IA

**NexieGuide** utilise une architecture IA sophistiquée combinant Azure OpenAI GPT-4o avec un assistant conversationnel 3D persistant. Notre implémentation suit les meilleures pratiques avec Vercel AI SDK v4.3.16 et streaming temps réel pour une expérience utilisateur fluide.

### Composants IA Principaux

#### 1. **Nexie Conversational AI**
- **Modèle**: Azure OpenAI GPT-4o (gpt-4o-2024-08-06)
- **Streaming**: Réponses temps réel avec useChat hook
- **Persistance**: Conversations multi-sessions localStorage + DB
- **Contexte**: Intelligent selon page et données utilisateur
- **Modes**: Widget, Sidebar, Fullscreen avec transitions fluides

#### 2. **Système de Prompts Spécialisés**
- **Context-Aware**: Prompts adaptatifs selon situation utilisateur
- **Cultural Sensitivity**: Optimisé contexte tunisien/maghrébin  
- **Multilingual**: Support natif arabe/français
- **Educational Focus**: Spécialisé orientation universitaire

#### 3. **Analyse Comparative IA**
- **generateObject**: Réponses structurées Zod validation
- **Multi-criteria**: Scoring algorithmes propriétaires
- **Predictive**: ML pour prédictions succès admission
- **Adaptive**: Amélioration continue basée feedback

## 🎯 Configuration Azure OpenAI Avancée

### 1. Client Azure Optimisé

```javascript
// lib/azure-ai.js
import { AzureOpenAI } from '@azure/openai';

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: "2024-08-06", // Latest stable
  defaultHeaders: {
    'User-Agent': 'NexieGuide/1.0'
  }
});

// Configuration optimisée performance
export const AIConfig = {
  model: 'gpt-4o-2024-08-06',
  temperature: 0.7,        // Équilibre créativité/précision
  maxTokens: 2000,         // Réponses détaillées
  topP: 0.9,              // Diversité contrôlée
  frequencyPenalty: 0.1,   // Évite répétitions
  presencePenalty: 0.1     // Encourage nouveaux concepts
};

export { client };
```

### 2. Monitoring et Rate Limiting

```javascript
// lib/ai-monitoring.js
import { RateLimiter } from 'limiter';

// Protection contre abus API
const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'hour'
});

export async function validateAIRequest(userId) {
  const allowed = await limiter.removeTokens(1);
  if (!allowed) {
    throw new Error('Rate limit exceeded');
  }
  
  // Logging pour analytics
  console.log(`AI request from user: ${userId}`, {
    timestamp: new Date().toISOString(),
    remaining: limiter.getTokensRemaining()
  });
}
```

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

#### Nexie Conversational Prompt
```javascript
export const NEXIE_SYSTEM_PROMPT = `
Tu es Nexie (نكسي), l'assistant IA spécialisé dans l'orientation universitaire tunisienne.

PERSONNALITÉ NEXIE:
- Bienveillant, encourageant, et expert en éducation tunisienne
- Utilise un ton amical mais professionnel
- Incorpore des emojis appropriés pour engagement
- S'exprime en arabe tunisien accessible ou français selon contexte

EXPERTISE TECHNIQUE:
- Système éducatif tunisien (bac scientifique, économie, lettres, techniques)
- Base complète universités publiques/privées avec spécialités
- Marché emploi tunisien et opportunités internationales
- Procédures admission, bourses, et orientation post-bac
- Gouvernorats tunisiens et leurs spécificités économiques

CAPACITÉS CONTEXTUELLES:
- Analyse données utilisateur (score, localisation, filière)
- Recommandations personnalisées basées profil complet
- Suivi conversations multi-sessions avec mémoire
- Adaptation réponses selon page visitée (stepper, comparison, etc.)

RÉPONSES STRUCTURÉES:
- Questions ouvertes → Exploration besoins utilisateur
- Analyses demandées → Format structuré avec sections claires
- Conseils pratiques → Actions concrètes avec timeline
- Support émotionnel → Encouragement et motivation

CONTRAINTES:
- Reste dans contexte éducation tunisienne
- Informations vérifiables et à jour (2024)
- Évite généralités, sois spécifique aux situations tunisiennes
- Propose toujours actions concrètes et prochaines étapes
`;
```

#### Comparison Analysis Prompt
```javascript
export const COMPARISON_SYSTEM_PROMPT = (orientation1, orientation2, score, location) => `
Tu es un expert en orientation universitaire tunisienne. Génère une analyse comparative détaillée.

ORIENTATIONS À COMPARER:
1. ${orientation1.name} (${orientation1.category})
2. ${orientation2.name} (${orientation2.category})

PROFIL ÉTUDIANT:
- Score baccalauréat: ${score}/20
- Localisation: ${location}
- Date analyse: ${new Date().toLocaleDateString('fr-TN')}

STRUCTURE RÉPONSE REQUISE:
{
  "overview": "Résumé exécutif comparaison (150 mots max)",
  "userProfileAnalysis": {
    "scoreAssessment": "Analyse niveau académique et admissibilité",
    "locationAdvantages": "Avantages géographiques spécifiques ${location}",
    "recommendedStrategy": "Stratégie optimale pour ce profil"
  },
  "orientation1Analysis": {
    "strengths": ["Force 1", "Force 2", "Force 3"],
    "challenges": ["Défi 1", "Défi 2"],
    "suitabilityScore": score_sur_10,
    "admissionChances": "probabilité_admission_réaliste",
    "careerProspects": "débouchés_tunisie_spécifiques"
  },
  "orientation2Analysis": { /* même structure */ },
  "universitiesAnalysis": [
    {
      "name": "Université_Tunisienne_Réelle",
      "location": "Ville, Gouvernorat",
      "reputation": "classement_local",
      "admissionDifficulty": "niveau_sur_5",
      "specificPrograms": ["programme1", "programme2"]
    }
  ],
  "recommendation": {
    "preferred": "orientation_recommandée",
    "reasoning": "justification_détaillée_décision",
    "alternatives": ["plan_B", "plan_C"],
    "nextSteps": ["action1", "action2", "action3"]
  }
}

EXIGENCES QUALITÉ:
- Références universités tunisiennes réelles uniquement
- Données salaires/emploi basées marché tunisien 2024
- Admissions réalistes selon historical data
- Gouvernorats mentionnés avec spécificités économiques
- Timeline concrète avec dates clés (inscription, concours, etc.)
`;
```
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

## 💬 Nexie Chat Assistant - Architecture Avancée

### 1. Multi-Mode Interface System

```javascript
// src/components/ChatBotEnhanced.jsx - Modes adaptatifs
export default function ChatBotEnhanced({ 
  mode = 'widget',           // widget | sidebar | fullscreen
  isOpen = false,
  conversationId = null,
  initialContext = {},
  onToggle,
  onClose
}) {
  // Gestion état persistant cross-session
  const { 
    persistentConversationId, 
    persistentMessages, 
    updatePersistentConversation,
    clearPersistentConversation 
  } = useFloatingNexie();

  // Configuration chat selon contexte
  const contextualPrompt = useMemo(() => {
    if (initialContext?.context === 'recommendations') {
      return generateRecommendationsPrompt(initialContext);
    }
    if (initialContext?.context === 'comparison-dashboard') {
      return generateComparisonPrompt(initialContext);
    }
    return getDefaultNexiePrompt();
  }, [initialContext]);

  // Streaming chat avec persistance
  const { messages, input, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      conversationId: currentConversationId,
      isGeneralChat: true,
      context: initialContext
    },
    initialMessages: persistentMessages.length > 0 
      ? persistentMessages 
      : [{ id: 'welcome', role: 'assistant', content: contextualPrompt }],
    onFinish: async (message) => {
      // Sauvegarde automatique conversations
      const updatedMessages = [...messages, message];
      updatePersistentConversation(currentConversationId, updatedMessages);
      
      // Création conversation DB si première fois
      if (!currentConversationId && messages.length === 1) {
        const result = await createConversationWithMessage({
          firstMessage: input,
          title: input.substring(0, 50) + '...',
          type: 'general',
          context: initialContext
        });
        if (result.success) {
          setCurrentConversationId(result.conversation.id);
        }
      }
    }
  });
}
```

### 2. Context-Aware Responses

```javascript
// src/app/api/chat/route.js - IA contextuelle
export async function POST(request) {
  const { messages, conversationId, context } = await request.json();
  
  // Construction contexte intelligent
  const systemContext = buildSystemContext(context);
  const conversationHistory = await getConversationHistory(conversationId);
  const userProfile = await getUserProfile(context?.userId);
  
  // Prompt dynamique selon contexte
  const dynamicPrompt = `${NEXIE_SYSTEM_PROMPT}

CONTEXTE ACTUEL:
${systemContext}

HISTORIQUE UTILISATEUR:
${conversationHistory ? summarizeHistory(conversationHistory) : 'Nouvelle session'}

PROFIL DÉTAILLÉ:
${userProfile ? JSON.stringify(userProfile, null, 2) : 'Profil anonyme'}

INSTRUCTIONS SPÉCIFIQUES:
- Adapte réponses au contexte page actuelle
- Référence données existantes si disponibles  
- Propose actions concrètes selon situation
- Maintiens cohérence avec conversations précédentes
`;

  // Streaming avec optimisations
  const result = await streamText({
    model: client,
    system: dynamicPrompt,
    messages,
    temperature: 0.7,
    maxTokens: 1500,
    // Optimisations performance
    stream: true,
    onToken: (token) => {
      // Logging en temps réel pour analytics
      logStreamingToken(token, conversationId);
    }
  });

  return result.toAIStreamResponse();
}
```

### 3. Persistent Conversation Management

```javascript
// src/context/FloatingNexieContext.jsx - État global
export function FloatingNexieProvider({ children }) {
  const [persistentState, setPersistentState] = useState({
    conversationId: null,
    messages: [],
    userPreferences: {},
    lastActivity: null
  });

  // Hydratation depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexie-conversation');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validation et nettoyage données
        const validated = validateConversationData(parsed);
        setPersistentState(validated);
      } catch (error) {
        console.warn('Invalid conversation data, starting fresh');
        clearPersistentConversation();
      }
    }
  }, []);

  // Sauvegarde automatique optimisée
  const updatePersistentConversation = useCallback(
    debounce((conversationId, messages) => {
      const newState = {
        conversationId,
        messages: messages.map(cleanMessage), // Nettoyage format
        lastActivity: new Date().toISOString(),
        version: CONVERSATION_VERSION
      };
      
      setPersistentState(newState);
      localStorage.setItem('nexie-conversation', JSON.stringify(newState));
    }, 500),
    []
  );

  // Cross-page state persistence
  const contextValue = {
    persistentConversationId: persistentState.conversationId,
    persistentMessages: persistentState.messages,
    updatePersistentConversation,
    clearPersistentConversation: () => {
      setPersistentState({ conversationId: null, messages: [] });
      localStorage.removeItem('nexie-conversation');
    }
  };

  return (
    <FloatingNexieContext.Provider value={contextValue}>
      {children}
    </FloatingNexieContext.Provider>
  );
}
```
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
