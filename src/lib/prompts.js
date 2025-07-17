// System prompts for AI comparison generation
export const COMPARISON_SYSTEM_PROMPT = `
Tu es un conseiller d'orientation expert spécialisé dans le système éducatif tunisien et le baccalauréat tunisien. 
Tu aides les étudiants tunisiens à comparer deux orientations universitaires en analysant chaque critère avec des notes détaillées.

Contexte important:
- Le système de notation tunisien va de 0 à 200 points
- Les universités publiques en Tunisie ont des seuils d'admission spécifiques
- Le marché de l'emploi tunisien a ses propres particularités
- Considère les gouvernorats tunisiens et leurs spécificités économiques

Instructions pour l'analyse:
1. Évalue chaque orientation sur 6 critères principaux avec des notes sur 100
2. Pour chaque critère, fournis une note justifiée et une explication détaillée
3. Compare les deux orientations point par point
4. Fournis des recommandations personnalisées basées sur le profil de l'étudiant

Critères d'évaluation obligatoires:
- فرص القبول (Chances d'admission) /100
- سوق العمل (Marché de l'emploi) /100  
- المرتب المتوقع (Salaire attendu) /100
- صعوبة الدراسة (Difficulté des études) /100
- التطوير المهني (Développement professionnel) /100
- الاستقرار الوظيفي (Stabilité professionnelle) /100

Format de réponse attendu: JSON structuré avec notes détaillées pour chaque critère.
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

  // Get latest score from bacScores
  const getLatestScore = (orientation) => {
    if (!orientation?.bacScores || !Array.isArray(orientation.bacScores)) return 'Non spécifié';
    const mathsScore = orientation.bacScores.find(score => score.bacType === 'رياضيات');
    const scienceScore = orientation.bacScores.find(score => score.bacType === 'علوم تجريبية');
    const artsScore = orientation.bacScores.find(score => score.bacType === 'آداب');
    
    const latest2024 = mathsScore?.score2024 || scienceScore?.score2024 || artsScore?.score2024;
    const latest2023 = mathsScore?.score2023 || scienceScore?.score2023 || artsScore?.score2023;
    
    return latest2024 || latest2023 || 'Non spécifié';
  };

  return `
Analyse et compare ces deux orientations universitaires pour un étudiant tunisien:

ORIENTATION 1: ${orientation1?.licence || orientation1?.name || 'Non spécifiée'}
- Code: ${orientation1?.code || 'N/A'}
- Université: ${orientation1?.university || orientation1?.institution || 'Non spécifiée'}
- Hub: ${orientation1?.hub || orientation1?.location || 'Non spécifié'}
- Catégorie: ${orientation1?.category || orientation1?.domaine || 'Non spécifiée'}
- Description: ${orientation1?.description || orientation1?.licence || 'Non spécifiée'}
- Score minimum requis: ${getLatestScore(orientation1)}/200
- Compétences: ${safeJoin(orientation1?.skills)}
- Débouchés: ${safeJoin(orientation1?.careers)}

ORIENTATION 2: ${orientation2?.licence || orientation2?.name || 'Non spécifiée'}
- Code: ${orientation2?.code || 'N/A'}
- Université: ${orientation2?.university || orientation2?.institution || 'Non spécifiée'}
- Hub: ${orientation2?.hub || orientation2?.location || 'Non spécifié'}
- Catégorie: ${orientation2?.category || orientation2?.domaine || 'Non spécifiée'}
- Description: ${orientation2?.description || orientation2?.licence || 'Non spécifiée'}
- Score minimum requis: ${getLatestScore(orientation2)}/200
- Compétences: ${safeJoin(orientation2?.skills)}
- Débouchés: ${safeJoin(orientation2?.careers)}

PROFIL DE L'ÉTUDIANT:
- Score au bac: ${userProfile?.score || 0}/200 (système tunisien)
- Localisation: ${userProfile?.location || 'Non spécifiée'}
- Date de sélection: ${userProfile?.selectedAt ? new Date(userProfile.selectedAt).toLocaleDateString('fr-TN') : 'Non spécifiée'}

ANALYSE DEMANDÉE:
Fournis une analyse complète au format JSON avec la structure suivante:
{
  "summary": {
    "recommendation": "nom_de_l_orientation_recommandée",
    "confidence": score_de_confiance_0_100,
    "reasoning": "Explication détaillée du choix en arabe"
  },
  "criteriaComparison": {
    "فرص القبول": {
      "orientation1": {
        "score": score_sur_100,
        "note": "تفسير مفصل للنقطة باللغة العربية",
        "details": "شرح مفصل عن سبب هذه النقطة وعوامل التقييم"
      },
      "orientation2": {
        "score": score_sur_100,
        "note": "تفسير مفصل للنقطة باللغة العربية", 
        "details": "شرح مفصل عن سبب هذه النقطة وعوامل التقييم"
      }
    },
    "سوق العمل": {
      "orientation1": {
        "score": score_sur_100,
        "note": "تقييم فرص العمل والطلب في السوق التونسي",
        "details": "تحليل مفصل لوضع سوق العمل والفرص المتاحة"
      },
      "orientation2": {
        "score": score_sur_100,
        "note": "تقييم فرص العمل والطلب في السوق التونسي",
        "details": "تحليل مفصل لوضع سوق العمل والفرص المتاحة"
      }
    },
    "المرتب المتوقع": {
      "orientation1": {
        "score": score_sur_100,
        "note": "تقييم مستوى الراتب المتوقع في تونس",
        "details": "معلومات مفصلة عن نطاق الرواتب والعوامل المؤثرة"
      },
      "orientation2": {
        "score": score_sur_100,
        "note": "تقييم مستوى الراتب المتوقع في تونس",
        "details": "معلومات مفصلة عن نطاق الرواتب والعوامل المؤثرة"
      }
    },
    "صعوبة الدراسة": {
      "orientation1": {
        "score": score_sur_100,
        "note": "تقييم مستوى صعوبة المنهج والدراسة",
        "details": "تفاصيل عن طبيعة المواد ومتطلبات النجاح"
      },
      "orientation2": {
        "score": score_sur_100,
        "note": "تقييم مستوى صعوبة المنهج والدراسة",
        "details": "تفاصيل عن طبيعة المواد ومتطلبات النجاح"
      }
    },
    "التطوير المهني": {
      "orientation1": {
        "score": score_sur_100,
        "note": "تقييم فرص التطوير والتقدم المهني",
        "details": "معلومات عن مسارات التطوير والدراسات العليا"
      },
      "orientation2": {
        "score": score_sur_100,
        "note": "تقييم فرص التطوير والتقدم المهني",
        "details": "معلومات عن مسارات التطوير والدراسات العليا"
      }
    },
    "الاستقرار الوظيفي": {
      "orientation1": {
        "score": score_sur_100,
        "note": "تقييم مدى الاستقرار في هذا المجال",
        "details": "تحليل استقرار القطاع والأمان الوظيفي"
      },
      "orientation2": {
        "score": score_sur_100,
        "note": "تقييم مدى الاستقرار في هذا المجال",
        "details": "تحليل استقرار القطاع والأمان الوظيفي"
      }
    }
  },
  "overallScores": {
    "orientation1": {
      "total": مجموع_النقاط_من_600,
      "percentage": النسبة_المئوية,
      "name": "اسم التخصص الأول"
    },
    "orientation2": {
      "total": مجموع_النقاط_من_600,
      "percentage": النسبة_المئوية,
      "name": "اسم التخصص الثاني"
    }
  },
  "finalRecommendation": {
    "winner": "اسم التخصص الفائز",
    "reasoning": "تفسير مفصل لسبب التوصية باللغة العربية",
    "nextSteps": ["خطوة 1", "خطوة 2", "خطوة 3"]
  }
}

ملاحظات مهمة:
- استخدم اللغة العربية في جميع النصوص والتفسيرات
- اجعل النقاط واقعية ومبررة بناء على المعطيات
- قدم تفاصيل مفيدة وعملية في كل قسم "details"
- تأكد من أن مجموع النقاط من 600 (6 معايير × 100 نقطة)
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
