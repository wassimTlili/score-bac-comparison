/**
 * Utility functions for analysis generation and processing
 */

/**
 * Create a fallback analysis when AI generation fails
 * @param {Object} orientation1 
 * @param {Object} orientation2 
 * @param {Object} userProfile 
 * @returns {Object} Basic comparison analysis
 */
export function createFallbackAnalysis(orientation1, orientation2, userProfile) {
  // Helper function to get minimum score from bacScores
  const getMinScore = (orientation) => {
    if (!orientation.bacScores || orientation.bacScores.length === 0) return 100;
    return Math.min(...orientation.bacScores.map(score => score.score2024 || score.score2023 || score.score2022 || 100));
  };

  const minScore1 = getMinScore(orientation1);
  const minScore2 = getMinScore(orientation2);

  return {
    overview: `Comparaison entre ${orientation1.licence || orientation1.name} et ${orientation2.licence || orientation2.name} pour un étudiant avec un score de ${userProfile.score}/200 à ${userProfile.location}.`,
    
    orientation1Analysis: {
      strengths: [`Domaine: ${orientation1.licence || orientation1.name}`, "Opportunités variées", "Formation reconnue"],
      challenges: ["Compétition à l'admission", "Exigences académiques"],
      suitabilityScore: userProfile.score >= minScore1 ? 7 : 4,
      careerProspects: ["Secteur public", "Secteur privé", "Entrepreneuriat"]
    },
    
    orientation2Analysis: {
      strengths: [`Domaine: ${orientation2.licence || orientation2.name}`, "Opportunités variées", "Formation reconnue"],
      challenges: ["Compétition à l'admission", "Exigences académiques"],
      suitabilityScore: userProfile.score >= minScore2 ? 7 : 4,
      careerProspects: ["Secteur public", "Secteur privé", "Entrepreneuriat"]
    },
    
    recommendation: {
      preferred: userProfile.score >= minScore1 ? (orientation1.licence || orientation1.name) : (orientation2.licence || orientation2.name),
      reasoning: "Recommandation basée sur l'admissibilité selon votre score au baccalauréat.",
      actionSteps: [
        "Vérifier les prérequis détaillés",
        "Préparer votre dossier d'inscription",
        "Consulter un conseiller d'orientation"
      ]
    },
    
    universitiesComparison: [
      {
        orientation: orientation1.name,
        university: orientation1.university,
        location: orientation1.hub,
        admissionDifficulty: userProfile.score >= orientation1.minScore ? 'moyenne' : 'difficile',
        reputation: 'bonne',
        facilities: 'Infrastructures standards'
      },
      {
        orientation: orientation2.name,
        university: orientation2.university,
        location: orientation2.hub,
        admissionDifficulty: userProfile.score >= orientation2.minScore ? 'moyenne' : 'difficile',
        reputation: 'bonne',
        facilities: 'Infrastructures standards'
      }
    ],
    
    generatedAt: new Date(),
    modelUsed: 'fallback',
    isFallback: true
  };
}

/**
 * Validate orientation data before AI processing
 * @param {Object} orientation1 
 * @param {Object} orientation2 
 * @param {Object} userProfile 
 * @returns {Object} Validation result
 */
export function validateComparisonData(orientation1, orientation2, userProfile) {
  const errors = [];
  
  if (!orientation1 || !orientation2) {
    errors.push('Both orientations are required');
  }
  
  if (!userProfile || !userProfile.score) {
    errors.push('User profile with score is required');
  }
  
  if (userProfile && (userProfile.score < 0 || userProfile.score > 200)) {
    errors.push('Score must be between 0 and 200');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
