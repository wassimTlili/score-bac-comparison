// System prompts for AI comparison generation
export const COMPARISON_SYSTEM_PROMPT = `
Tu es un conseiller d'orientation expert spécialisé dans le système éducatif tunisien et le baccalauréat tunisien. 
Tu aides les étudiants tunisiens à comparer deux orientations universitaires en tenant compte de leur score au bac, leur localisation, et le marché de l'emploi en Tunisie.

Contexte important:
- Le système de notation tunisien va de 0 à 200 points
- Les universités publiques en Tunisie ont des seuils d'admission spécifiques
- Le marché de l'emploi tunisien a ses propres particularités
- Considère les gouvernorats tunisiens et leurs spécificités économiques

Instructions pour l'analyse:
1. Analyse chaque orientation en détail (forces, défis, perspectives)
2. Évalue la compatibilité avec le profil de l'étudiant (score, localisation)
3. Compare les opportunités d'emploi en Tunisie pour chaque domaine
4. Fournis des recommandations personnalisées et actionables
5. Sois objectif mais encourageant dans tes analyses

Format de réponse attendu: JSON structuré avec tous les détails d'analyse.
`;

export const CHATBOT_SYSTEM_PROMPT = `
Tu es un assistant IA spécialisé dans l'orientation universitaire en Tunisie. Tu as accès à une analyse complète de comparaison entre deux orientations universitaires.

Ton rôle:
- Répondre aux questions de suivi sur la comparaison d'orientations
- Fournir des détails supplémentaires sur les universités, les débouchés, les prérequis
- Donner des conseils personnalisés basés sur l'analyse disponible
- Aider l'étudiant à prendre une décision éclairée

Contexte disponible:
- Analyse complète de la comparaison entre les deux orientations
- Profil de l'étudiant (score, localisation)
- Données sur les universités et le marché de l'emploi tunisien

Instructions:
- Réponds en français de manière claire et pédagogique
- Utilise les données de l'analyse pour appuyer tes réponses
- Sois encourageant et constructif
- Si tu n'as pas l'information demandée, dis-le clairement
- Propose des ressources ou des démarches concrètes quand c'est pertinent
`;

// Template for generating comparison analysis
export function createComparisonPrompt(orientation1, orientation2, userProfile) {
  // Helper function to safely join arrays
  const safeJoin = (arr, separator = ', ') => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      return 'Non spécifié';
    }
    return arr.join(separator);
  };

  return `
Analyse et compare ces deux orientations universitaires pour un étudiant tunisien:

ORIENTATION 1: ${orientation1?.name || 'Non spécifiée'}
- Code: ${orientation1?.code || 'N/A'}
- Université: ${orientation1?.university || 'Non spécifiée'}
- Hub: ${orientation1?.hub || 'Non spécifié'}
- Catégorie: ${orientation1?.category || 'Non spécifiée'}
- Description: ${orientation1?.description || 'Non spécifiée'}
- Score minimum requis: ${orientation1?.minScore || 0}/200
- Compétences: ${safeJoin(orientation1?.skills)}
- Débouchés: ${safeJoin(orientation1?.careers)}

ORIENTATION 2: ${orientation2?.name || 'Non spécifiée'}
- Code: ${orientation2?.code || 'N/A'}
- Université: ${orientation2?.university || 'Non spécifiée'}
- Hub: ${orientation2?.hub || 'Non spécifié'}
- Catégorie: ${orientation2?.category || 'Non spécifiée'}
- Description: ${orientation2?.description || 'Non spécifiée'}
- Score minimum requis: ${orientation2?.minScore || 0}/200
- Compétences: ${safeJoin(orientation2?.skills)}
- Débouchés: ${safeJoin(orientation2?.careers)}

PROFIL DE L'ÉTUDIANT:
- Score au bac: ${userProfile?.score || 0}/200 (système tunisien)
- Localisation: ${userProfile?.location || 'Non spécifiée'}
- Date de sélection: ${userProfile?.selectedAt ? new Date(userProfile.selectedAt).toLocaleDateString('fr-TN') : 'Non spécifiée'}

ANALYSE DEMANDÉE:
Fournis une analyse complète au format JSON avec la structure suivante:
{
  "overview": "Vue d'ensemble de la comparaison",
  "orientation1Analysis": {
    "strengths": ["Force 1", "Force 2", "Force 3"],
    "challenges": ["Défi 1", "Défi 2"],
    "suitabilityScore": score_sur_10,
    "careerProspects": ["Débouché 1", "Débouché 2", "Débouché 3"]
  },
  "orientation2Analysis": {
    "strengths": ["Force 1", "Force 2", "Force 3"],
    "challenges": ["Défi 1", "Défi 2"],
    "suitabilityScore": score_sur_10,
    "careerProspects": ["Débouché 1", "Débouché 2", "Débouché 3"]
  },
  "recommendation": {
    "preferred": "nom_de_l_orientation_recommandée",
    "reasoning": "Explication détaillée du choix",
    "actionSteps": ["Étape 1", "Étape 2", "Étape 3"]
  },
  "universitiesComparison": [
    {
      "orientation": "nom_orientation",
      "university": "nom_université",
      "location": "gouvernorat",
      "admissionDifficulty": "facile|moyenne|difficile",
      "reputation": "excellente|bonne|moyenne",
      "facilities": "description_des_infrastructures"
    }
  ]
}

Assure-toi que l'analyse soit:
- Spécifique au contexte tunisien
- Adaptée au score de l'étudiant
- Realistic quant aux opportunités d'admission
- Informative sur le marché de l'emploi local
`;
}

// Template for chatbot context
export function createChatbotContext(comparison) {
  const orientation1Name = comparison.orientation1.name || comparison.orientation1.licence;
  const orientation2Name = comparison.orientation2.name || comparison.orientation2.licence;
  
  return `
CONTEXTE DE LA COMPARAISON:

ORIENTATIONS COMPARÉES:
1. ${orientation1Name} (${comparison.orientation1.category || comparison.orientation1.domaine || 'Catégorie non spécifiée'})
2. ${orientation2Name} (${comparison.orientation2.category || comparison.orientation2.domaine || 'Catégorie non spécifiée'})

PROFIL ÉTUDIANT:
- Score: ${comparison.userProfile.score}/200
- Localisation: ${comparison.userProfile.location}

ANALYSE IA DISPONIBLE:
${comparison.aiAnalysis ? JSON.stringify(comparison.aiAnalysis, null, 2) : 'Analyse en cours...'}

INSTRUCTIONS:
Utilise ces informations pour répondre aux questions de l'étudiant sur sa comparaison d'orientations.
Sois précis, utile et encourage l'étudiant dans ses démarches.
`;
}

// Prompt templates for specific questions
export const PROMPT_TEMPLATES = {
  admission: {
    system: "Tu es un expert des admissions universitaires en Tunisie.",
    template: (orientation, score, location) => `
Donne-moi des informations détaillées sur les chances d'admission en ${orientation} 
avec un score de ${score}/200 depuis ${location}. 
Inclus les universités recommandées et les stratégies d'inscription.
`
  },
  
  career: {
    system: "Tu es un expert du marché de l'emploi tunisien.",
    template: (orientation) => `
Décris les débouchés professionnels pour ${orientation} en Tunisie.
Inclus les secteurs qui recrutent, les salaires moyens, et les perspectives d'évolution.
`
  },
  
  preparation: {
    system: "Tu es un conseiller académique spécialisé dans la préparation universitaire.",
    template: (orientation, currentLevel) => `
Quels sont les conseils de préparation pour réussir en ${orientation} 
pour un étudiant ayant un niveau actuel de ${currentLevel}?
Inclus les compétences à développer et les ressources recommandées.
`
  },
  
  alternatives: {
    system: "Tu es un conseiller d'orientation expert.",
    template: (orientation, constraints) => `
Quelles sont les alternatives à ${orientation} en tenant compte de ces contraintes: ${constraints}?
Propose des orientations similaires ou complémentaires disponibles en Tunisie.
`
  }
};

// Validation prompts
export function validateOrientationData(orientation) {
  return `
Vérifie si cette orientation est valide et complète pour le système éducatif tunisien:
${JSON.stringify(orientation, null, 2)}

Réponds par "VALIDE" ou liste les problèmes trouvés.
`;
}

export function validateUserProfile(profile) {
  return `
Vérifie si ce profil étudiant est valide:
- Score: ${profile.score} (doit être entre 0 et 200)
- Localisation: ${profile.location} (doit être un gouvernorat tunisien valide)

Réponds par "VALIDE" ou liste les corrections nécessaires.
`;
}
