'use server'

import { nanoid } from 'nanoid'
import { getOrientationByCode } from '@/lib/orientations'
import { generateComparisonAnalysis } from './ai-comparison'
import comparisonStorage from '@/lib/comparison-storage'

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

    // Store comparison in database
    const savedComparison = await comparisonStorage.create(comparisonData)

    return { success: true, comparisonId }
  } catch (error) {
    console.error('Error creating comparison:', error)
    return { success: false, error: error.message }
  }
}

export async function generateAiAnalysis(comparisonId) {
  try {
    const comparison = await comparisonStorage.getById(comparisonId)
    if (!comparison) {
      throw new Error('Comparison not found')
    }

    // If analysis already exists, return it
    if (comparison.aiAnalysis) {
      return { success: true, aiAnalysis: comparison.aiAnalysis }
    }

    // Generate AI analysis
    const aiAnalysis = await generateComparisonAnalysis(comparison)

    // Update comparison with AI analysis in database
    await comparisonStorage.updateAiAnalysis(comparisonId, aiAnalysis)

    return { success: true, aiAnalysis }
  } catch (error) {
    console.error('Error generating AI analysis:', error)
    return { success: false, error: error.message }
  }
}

export async function getComparison(id) {
  try {
    const comparison = await comparisonStorage.getById(id)
    if (!comparison) {
      return null
    }
    
    // Convert to plain object for client components
    return {
      id: comparison.id,
      orientation1: comparison.orientation1,
      orientation2: comparison.orientation2,
      userProfile: comparison.userProfile,
      aiAnalysis: comparison.aiAnalysis,
      createdAt: comparison.createdAt
    }
  } catch (error) {
    console.error('Error getting comparison:', error)
    return null
  }
}
