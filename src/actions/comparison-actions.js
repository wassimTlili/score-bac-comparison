'use server';

import { revalidatePath } from 'next/cache';
import comparisonStorage from '../lib/comparison-storage.js';
import { generateComparison, validateComparisonInput, enhanceAnalysis } from './ai-comparison.js';
import { createFallbackAnalysis } from '../lib/analysis-utils.js';
import { getOrientationById, getOrientationByCode } from '../lib/orientations.js';

/**
 * Create a new comparison between two orientations
 * @param {FormData} formData - Form data from the comparison form
 * @returns {Promise<void>} Redirects to comparison page or returns error
 */
export async function createComparison(formData) {
  try {
    // Extract form data
    const orientation1Id = formData.get('orientation1');
    const orientation2Id = formData.get('orientation2');
    const score = parseFloat(formData.get('score'));
    const location = formData.get('location');

    // Validate input
    if (!orientation1Id || !orientation2Id || !score || !location) {
      throw new Error('Tous les champs sont requis');
    }

    if (score < 0 || score > 200) {
      throw new Error('Le score doit être entre 0 et 200');
    }

    if (orientation1Id === orientation2Id) {
      throw new Error('Veuillez sélectionner deux orientations différentes');
    }

    // Get orientation data
    const orientation1 = getOrientationByCode(orientation1Id);
    const orientation2 = getOrientationByCode(orientation2Id);

    if (!orientation1 || !orientation2) {
      throw new Error('Orientations non trouvées');
    }

    // Create user profile
    const userProfile = {
      score,
      location,
      selectedAt: new Date()
    };

    // Validate comparison input
    const validation = await validateComparisonInput(orientation1, orientation2, userProfile);
    if (!validation.isValid) {
      const errorMessage = validation.errors && Array.isArray(validation.errors) 
        ? validation.errors.join(', ') 
        : 'Validation failed';
      throw new Error(errorMessage);
    }

    // Create comparison in storage (without AI analysis first)
    const comparison = await comparisonStorage.create({
      orientation1,
      orientation2,
      userProfile
    });

    // Return success with comparison ID instead of redirecting
    return {
      success: true,
      comparisonId: comparison.id
    };

  } catch (error) {
    console.error('Error creating comparison:', error);
    
    // Return error to be handled by the form
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate AI analysis for an existing comparison
 * @param {string} comparisonId - ID of the comparison
 * @returns {Promise<Object>} Updated comparison with AI analysis
 */
export async function generateAiAnalysis(comparisonId) {
  try {
    // Get comparison
    const comparison = await comparisonStorage.getById(comparisonId);
    if (!comparison) {
      throw new Error('Comparaison non trouvée');
    }

    // Skip if analysis already exists
    if (comparison.aiAnalysis) {
      return { success: true, data: comparison };
    }

    // Generate AI analysis with timeout
    const aiResult = await Promise.race([
      generateComparison(
        comparison.orientation1,
        comparison.orientation2,
        comparison.userProfile
      ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI generation timeout')), 15000)
      )
    ]);

    if (!aiResult.success) {
      console.warn('⚠️ AI generation failed, using fallback:', aiResult.error);
    }

    // Enhance analysis with additional insights
    const enhancedAnalysis = await enhanceAnalysis(
      aiResult.data,
      comparison.orientation1,
      comparison.orientation2,
      comparison.userProfile
    );

    // Update comparison with AI analysis
    const updatedComparison = await comparisonStorage.updateAiAnalysis(
      comparisonId,
      enhancedAnalysis
    );

    // Note: Don't revalidate during render - this will be handled by client-side navigation
    // revalidatePath(`/comparison/${comparisonId}`);

    return {
      success: true,
      data: updatedComparison
    };

  } catch (error) {
    console.error('❌ Error generating AI analysis:', error);
    
    // Even if AI fails, try to save a basic fallback analysis
    try {
      const comparison = await comparisonStorage.getById(comparisonId);
      if (comparison && !comparison.aiAnalysis) {
        const fallbackAnalysis = await enhanceAnalysis(
          createFallbackAnalysis(comparison.orientation1, comparison.orientation2, comparison.userProfile),
          comparison.orientation1,
          comparison.orientation2,
          comparison.userProfile
        );
        
        await comparisonStorage.updateAiAnalysis(comparisonId, fallbackAnalysis);
      }
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get comparison by ID
 * @param {string} comparisonId - ID of the comparison
 * @returns {Promise<Object|null>} Comparison data or null if not found
 */
export async function getComparison(comparisonId) {
  try {
    const comparison = await comparisonStorage.getById(comparisonId);
    
    if (!comparison) {
      return null;
    }

    // Convert to plain object for client components
    return {
      id: comparison.id,
      orientation1: comparison.orientation1,
      orientation2: comparison.orientation2,
      userProfile: comparison.userProfile,
      aiAnalysis: comparison.aiAnalysis,
      createdAt: comparison.createdAt?.toISOString ? comparison.createdAt.toISOString() : comparison.createdAt,
      updatedAt: comparison.updatedAt?.toISOString ? comparison.updatedAt.toISOString() : comparison.updatedAt
    };
  } catch (error) {
    console.error('❌ Error getting comparison:', error);
    return null;
  }
}

/**
 * Update comparison data
 * @param {string} comparisonId - ID of the comparison
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated comparison
 */
export async function updateComparison(comparisonId, updateData) {
  try {
    const updatedComparison = await comparisonStorage.update(comparisonId, updateData);
    
    // Revalidate the comparison page
    revalidatePath(`/comparison/${comparisonId}`);
    
    return {
      success: true,
      data: updatedComparison
    };
  } catch (error) {
    console.error('Error updating comparison:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete comparison
 * @param {string} comparisonId - ID of the comparison to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteComparison(comparisonId) {
  try {
    const deleted = await comparisonStorage.delete(comparisonId);
    
    if (deleted) {
      // Revalidate home page
      revalidatePath('/');
      
      return {
        success: true,
        message: 'Comparaison supprimée avec succès'
      };
    } else {
      throw new Error('Comparaison non trouvée');
    }
  } catch (error) {
    console.error('Error deleting comparison:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Search comparisons
 * @param {Object} searchCriteria - Search criteria
 * @returns {Promise<Array>} Array of matching comparisons
 */
export async function searchComparisons(searchCriteria) {
  try {
    const comparisons = await comparisonStorage.search(searchCriteria);
    return {
      success: true,
      data: comparisons
    };
  } catch (error) {
    console.error('Error searching comparisons:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
}

/**
 * Get comparison statistics
 * @returns {Promise<Object>} Comparison statistics
 */
export async function getComparisonStats() {
  try {
    const stats = await comparisonStorage.getStats();
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting comparison stats:', error);
    return {
      success: false,
      data: {
        total: 0,
        byLocation: {},
        byOrientation: {},
        averageScore: 0,
        recentComparisons: 0
      },
      error: error.message
    };
  }
}

/**
 * Export comparison data (admin function)
 * @returns {Promise<Object>} Exported data
 */
export async function exportComparisons() {
  try {
    const exportData = await comparisonStorage.exportData();
    return {
      success: true,
      data: exportData
    };
  } catch (error) {
    console.error('Error exporting comparisons:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Import comparison data (admin function)
 * @param {Object} importData - Data to import
 * @returns {Promise<Object>} Import result
 */
export async function importComparisons(importData) {
  try {
    const result = await comparisonStorage.importData(importData);
    
    // Revalidate home page after import
    revalidatePath('/');
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error importing comparisons:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Regenerate AI analysis for a comparison
 * @param {string} comparisonId - ID of the comparison
 * @returns {Promise<Object>} Updated comparison with new AI analysis
 */
export async function regenerateAiAnalysis(comparisonId) {
  try {
    // Get comparison
    const comparison = await comparisonStorage.getById(comparisonId);
    if (!comparison) {
      throw new Error('Comparaison non trouvée');
    }

    // Clear existing analysis
    comparison.aiAnalysis = null;

    // Generate new AI analysis
    const aiResult = await generateComparison(
      comparison.orientation1,
      comparison.orientation2,
      comparison.userProfile
    );

    // Enhance analysis
    const enhancedAnalysis = enhanceAnalysis(
      aiResult.data,
      comparison.orientation1,
      comparison.orientation2,
      comparison.userProfile
    );

    // Update comparison
    const updatedComparison = await comparisonStorage.updateAiAnalysis(
      comparisonId,
      enhancedAnalysis
    );

    // Revalidate the comparison page
    revalidatePath(`/comparison/${comparisonId}`);

    return {
      success: true,
      data: updatedComparison
    };

  } catch (error) {
    console.error('Error regenerating AI analysis:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
