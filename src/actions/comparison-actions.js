'use server'

import { nanoid } from 'nanoid'
import { getOrientationByCode } from '@/lib/orientations'

// In-memory store for comparisons (simple and fast)
// Use globalThis to persist across hot reloads in development
if (!globalThis.comparisons) {
  globalThis.comparisons = new Map()
}
const comparisons = globalThis.comparisons

export async function createComparison(formData) {
  try {
    // Extract form data
    const orientation1Code = formData.get('orientation1')
    const orientation2Code = formData.get('orientation2')
    const bacScore = parseFloat(formData.get('bacScore'))
    const governorate = formData.get('governorate')

    // Validate inputs
    if (!orientation1Code || !orientation2Code || !bacScore || !governorate) {
      throw new Error('All fields are required')
    }

    if (bacScore < 0 || bacScore > 200) {
      throw new Error('BAC score must be between 0 and 200')
    }

    // Find orientations by code
    const orientation1 = getOrientationByCode(orientation1Code)
    const orientation2 = getOrientationByCode(orientation2Code)

    if (!orientation1) {
      throw new Error(`Orientation with code "${orientation1Code}" not found`)
    }

    if (!orientation2) {
      throw new Error(`Orientation with code "${orientation2Code}" not found`)
    }

    // Generate comparison ID
    const comparisonId = nanoid()

    // Create comparison data
    const comparisonData = {
      id: comparisonId,
      orientation1,
      orientation2,
      userProfile: {
        score: bacScore,
        location: governorate,
        bacType: 'général' // Default bac type for database
      },
      createdAt: new Date().toISOString(),
      // We'll generate AI analysis separately for better performance
      aiAnalysis: null
    }

    // Store comparison
    comparisons.set(comparisonId, comparisonData)

    return { success: true, comparisonId }
  } catch (error) {
    console.error('Error creating comparison:', error)
    return { success: false, error: error.message }
  }
}

export async function generateAiAnalysis(comparisonId) {
  try {
    const comparison = comparisons.get(comparisonId)
    if (!comparison) {
      throw new Error('Comparison not found')
    }

    // Generate AI analysis (mock for now)
    const aiAnalysis = generateMockAnalysis(
      comparison.orientation1, 
      comparison.orientation2, 
      comparison.userProfile.score, 
      comparison.userProfile.location
    )

    // Update comparison with AI analysis
    comparison.aiAnalysis = aiAnalysis
    comparisons.set(comparisonId, comparison)

    return { success: true, aiAnalysis }
  } catch (error) {
    console.error('Error generating AI analysis:', error)
    return { success: false, error: error.message }
  }
}

export async function getComparison(id) {
  const comparison = comparisons.get(id)
  if (!comparison) {
    return null
  }
  return comparison
}

function generateMockAnalysis(orientation1, orientation2, bacScore, governorate) {
  // Mock analysis based on orientations and score - updated structure to match ComparisonView
  const score1 = Math.min(10, Math.max(1, Math.round((bacScore / 20) + Math.random() * 2)));
  const score2 = Math.min(10, Math.max(1, Math.round((bacScore / 20) + Math.random() * 2)));
  const winner = score1 > score2 ? (orientation1.licence || orientation1.name) : score2 > score1 ? (orientation2.licence || orientation2.name) : 'Match équilibré';
  
  // Get the score threshold for each orientation
  const getThreshold = (orientation) => {
    if (orientation.bacScores && orientation.bacScores.length > 0) {
      return orientation.bacScores[0].score2024;
    }
    return orientation.seuil || 120; // fallback
  };
  
  const analysis = {
    // Overview section
    overview: `Analyse comparative détaillée entre ${orientation1.licence || orientation1.name} et ${orientation2.licence || orientation2.name} pour un étudiant avec un score de ${bacScore}/200 résidant en ${governorate}. Cette comparaison prend en compte vos critères académiques, géographiques et professionnels pour vous aider à faire le meilleur choix d'orientation.`,
    
    // User profile analysis
    userProfileAnalysis: {
      scoreAssessment: bacScore >= 150 
        ? `Excellent score de ${bacScore}/200 qui vous ouvre de nombreuses portes dans l'enseignement supérieur tunisien.`
        : bacScore >= 120 
        ? `Score solide de ${bacScore}/200 qui vous permet d'accéder à plusieurs orientations universitaires.`
        : `Score de ${bacScore}/200 qui nécessite une stratégie ciblée pour optimiser vos chances d'admission.`,
      locationAdvantages: `Résider en ${governorate} vous offre des avantages géographiques spécifiques selon les universités visées. Considérez les coûts de transport et d'hébergement dans votre décision finale.`
    },
    
    // Analysis for first orientation
    orientation1Analysis: {
      name: orientation1.licence || orientation1.name,
      suitabilityScore: score1,
      admissionDifficulty: bacScore >= getThreshold(orientation1) ? 'facile' : bacScore >= (getThreshold(orientation1) - 20) ? 'moyenne' : 'difficile',
      strengths: [
        `Excellent programme en ${orientation1.category || orientation1.domaine || 'ce domaine'}`,
        'Infrastructure moderne et bien équipée',
        'Corps professoral expérimenté',
        'Réseau d\'anciens développé',
        'Partenariats avec l\'industrie'
      ],
      challenges: [
        'Forte concurrence pour l\'admission',
        'Charge de travail intensive',
        'Exigences académiques élevées',
        'Coût potentiellement élevé'
      ],
      careerProspects: [
        `Spécialiste en ${orientation1.licence || orientation1.name}`,
        'Consultant technique',
        'Responsable de projet',
        'Chercheur/Doctorant',
        'Entrepreneur dans le secteur'
      ]
    },
    
    // Analysis for second orientation
    orientation2Analysis: {
      name: orientation2.licence || orientation2.name,
      suitabilityScore: score2,
      admissionDifficulty: bacScore >= getThreshold(orientation2) ? 'facile' : bacScore >= (getThreshold(orientation2) - 20) ? 'moyenne' : 'difficile',
      strengths: [
        `Spécialisation approfondie en ${orientation2.licence || orientation2.name}`,
        'Secteur en pleine expansion',
        'Bonnes opportunités d\'emploi',
        'Formation pratique solide',
        'Débouchés variés'
      ],
      challenges: [
        'Places limitées disponibles',
        'Évolution rapide du domaine',
        'Nécessité de formation continue',
        'Competition sur le marché'
      ],
      careerProspects: [
        `Spécialiste en ${orientation2.category || orientation2.domaine || 'ce domaine'}`,
        'Analyste technique',
        'Chef de département',
        'Formateur/Enseignant',
        'Consultant indépendant'
      ]
    },
    
    // Overall recommendation
    recommendation: {
      preferred: winner,
      reasoning: score1 > score2 
        ? `${orientation1.name || orientation1.licence} semble mieux adaptée à votre profil avec un score d'adéquation de ${score1}/10. Votre score de ${bacScore}/200 vous positionne favorablement pour cette orientation.`
        : score2 > score1
        ? `${orientation2.name || orientation2.licence} présente un meilleur potentiel pour vous avec un score d'adéquation de ${score2}/10. Cette orientation correspond mieux à vos critères actuels.`
        : `Les deux orientations présentent un potentiel équivalent pour votre profil. Le choix dépendra de vos préférences personnelles et objectifs de carrière.`,
      actionSteps: [
        'Rechercher davantage d\'informations sur les programmes détaillés',
        'Contacter les universités pour des visites ou journées portes ouvertes',
        'Consulter des professionnels du secteur',
        'Évaluer les aspects financiers et logistiques',
        'Préparer un plan de candidature stratégique'
      ],
      alternativeOptions: [
        'Écoles privées dans le même domaine',
        'Formations techniques spécialisées',
        'Programmes de formation continue',
        'Opportunités à l\'étranger avec bourses'
      ]
    },
    
    // Universities analysis - matching GitHub structure
    universitiesAnalysis: [
      {
        name: orientation1.university || orientation1.etablissement || `Université principale pour ${orientation1.name || orientation1.licence}`,
        location: orientation1.hub || orientation1.gouvernorat || governorate,
        orientation: orientation1.name || orientation1.licence,
        accessibility: bacScore >= (orientation1.minScore || orientation1.seuil || 100) 
          ? 'Accessible avec votre score actuel' 
          : 'Nécessite une amélioration du score',
        advantages: [
          'Proximité géographique favorable',
          'Infrastructure moderne',
          'Corps professoral qualifié',
          'Partenariats industriels'
        ]
      },
      {
        name: orientation2.university || orientation2.etablissement || `Université principale pour ${orientation2.name || orientation2.licence}`,
        location: orientation2.hub || orientation2.gouvernorat || governorate,
        orientation: orientation2.name || orientation2.licence,
        accessibility: bacScore >= (orientation2.minScore || orientation2.seuil || 100) 
          ? 'Accessible avec votre score actuel' 
          : 'Nécessite une amélioration du score',
        advantages: [
          'Spécialisation reconnue',
          'Laboratoires bien équipés',
          'Réseau professionnel étendu',
          'Opportunités de stages'
        ]
      }
    ],
    
    // Universities comparison (optional)
    universitiesComparison: [
      {
        university: orientation1.university || orientation1.etablissement || 'Université principale',
        orientation: orientation1.name || orientation1.licence,
        location: orientation1.hub || orientation1.gouvernorat || governorate,
        admissionDifficulty: bacScore >= 150 ? 'facile' : bacScore >= 120 ? 'moyenne' : 'difficile',
        reputation: 'Excellent',
        facilities: 'Laboratoires modernes, bibliothèque numérique, campus équipé'
      },
      {
        university: orientation2.university || orientation2.etablissement || 'Université alternative',
        orientation: orientation2.name || orientation2.licence,
        location: orientation2.hub || orientation2.gouvernorat || governorate,
        admissionDifficulty: bacScore >= 150 ? 'facile' : bacScore >= 120 ? 'moyenne' : 'difficile',
        reputation: 'Très bon',
        facilities: 'Équipements spécialisés, ateliers pratiques, ressources actualisées'
      }
    ],
    
    // Score insights
    scoreInsights: {
      canApplyTo1: bacScore >= (orientation1.minScore || orientation1.seuil || 100),
      canApplyTo2: bacScore >= (orientation2.minScore || orientation2.seuil || 100),
      scoreAdvantage: bacScore >= 160 ? 'Excellent' : bacScore >= 130 ? 'Bon' : 'Moyen',
      improvementNeeded: Math.max(0, Math.max(orientation1.minScore || orientation1.seuil || 100, orientation2.minScore || orientation2.seuil || 100) - bacScore)
    },
    
    // Metadata
    generatedAt: new Date().toISOString(),
    modelUsed: 'Mock Analysis v1.0',
    isFallback: false
  }

  return analysis
}
