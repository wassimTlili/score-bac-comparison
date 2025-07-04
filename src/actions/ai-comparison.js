'use server';

import { generateObject } from 'ai';
import { openai } from '../lib/azure-ai.js';
import { COMPARISON_SYSTEM_PROMPT, createComparisonPrompt } from '../lib/prompts.js';
import { createFallbackAnalysis } from '../lib/analysis-utils.js';
import { z } from 'zod';

// Zod schema for AI response validation
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

/**
 * Generate and store AI comparison analysis.
 * @param {Object} comparisonData - The full comparison object.
 * @returns {Promise<Object>} The generated AI analysis.
 */
export async function generateComparisonAnalysis(comparisonData) {
  const { orientation1, orientation2, userProfile } = comparisonData;

  try {
    const prompt = createComparisonPrompt(orientation1, orientation2, userProfile);

    const result = await generateObject({
      model: openai('gpt-4o'),
      system: COMPARISON_SYSTEM_PROMPT,
      prompt: prompt,
      schema: ComparisonAnalysisSchema,
      temperature: 0.7,
      maxTokens: 2000
    });

    const analysis = {
      ...result.object,
      generatedAt: new Date(),
      modelUsed: 'gpt-4o',
      promptTokens: result.usage?.promptTokens || 0,
      completionTokens: result.usage?.completionTokens || 0,
      isFallback: false
    };

    // This is where you would typically save the analysis to your database
    // For this example, we'll just return it.
    comparisonData.aiAnalysis = analysis;

    return analysis;

  } catch (error) {
    console.error('❌ Error generating AI comparison:', error);
    
    // Create and store fallback analysis
    const fallbackAnalysis = createFallbackAnalysis(orientation1, orientation2, userProfile);
    comparisonData.aiAnalysis = fallbackAnalysis;

    return fallbackAnalysis;
  }
}

/**
 * Validate orientation data before AI processing
 * @param {Object} orientation1 
 * @param {Object} orientation2 
 * @param {Object} userProfile 
 * @returns {Object} Validation result
 */
export async function validateComparisonInput(orientation1, orientation2, userProfile) {
  const errors = [];

  // Validate orientations
  if (!orientation1 || !orientation1.name || !orientation1.code) {
    errors.push('Orientation 1 data is incomplete');
  }
  
  if (!orientation2 || !orientation2.name || !orientation2.code) {
    errors.push('Orientation 2 data is incomplete');
  }

  // Check if orientations are different
  if (orientation1?.code === orientation2?.code) {
    errors.push('Cannot compare identical orientations');
  }

  // Validate user profile
  if (!userProfile || typeof userProfile.score !== 'number') {
    errors.push('User profile score is required');
  }

  if (userProfile?.score < 0 || userProfile?.score > 200) {
    errors.push('User score must be between 0 and 200');
  }

  if (!userProfile?.location) {
    errors.push('User location is required');
  }

  return {
    isValid: errors.length === 0,
    errors: errors || []
  };
}

/**
 * Enhanced analysis with additional insights
 * @param {Object} basicAnalysis 
 * @param {Object} orientation1 
 * @param {Object} orientation2 
 * @param {Object} userProfile 
 * @returns {Object} Enhanced analysis
 */
export async function enhanceAnalysis(basicAnalysis, orientation1, orientation2, userProfile) {
  // Helper function to get minimum score from bacScores
  const getMinScore = (orientation) => {
    if (!orientation.bacScores || orientation.bacScores.length === 0) return 100;
    return Math.min(...orientation.bacScores.map(score => score.score2024 || score.score2023 || score.score2022 || 100));
  };

  const minScore1 = getMinScore(orientation1);
  const minScore2 = getMinScore(orientation2);

  return {
    ...basicAnalysis,
    
    // Add score-based insights
    scoreInsights: {
      canApplyTo1: userProfile.score >= minScore1,
      canApplyTo2: userProfile.score >= minScore2,
      scoreAdvantage: userProfile.score > 170 ? 'excellent' : userProfile.score > 140 ? 'good' : 'average',
      improvementNeeded: Math.max(0, Math.max(minScore1, minScore2) - userProfile.score)
    },
    
    // Add location-based insights
    locationInsights: {
      localUniversities1: [{
        name: orientation1.university,
        hub: orientation1.hub,
        location: orientation1.hub // Using hub as location for now
      }],
      localUniversities2: [{
        name: orientation2.university,
        hub: orientation2.hub,
        location: orientation2.hub // Using hub as location for now
      }],
      needsRelocation: {
        orientation1: !orientation1.hub.includes(userProfile.location),
        orientation2: !orientation2.hub.includes(userProfile.location)
      }
    },
    
    // Add timeline insights
    timelineInsights: {
      urgency: 'high', // Based on current date and admission periods
      nextSteps: [
        'Consulter les dates d\'inscription',
        'Préparer les documents requis',
        'Visiter les universités potentielles'
      ],
      importantDates: [
        'Ouverture des inscriptions: Juillet',
        'Clôture des inscriptions: Septembre',
        'Résultats d\'affectation: Octobre'
      ]
    }
  };
}
