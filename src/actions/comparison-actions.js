'use server'

import { nanoid } from 'nanoid'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getOrientationByCode } from '@/lib/orientations'
import { generateComparisonAnalysis } from './ai-comparison'
import comparisonStorage from '@/lib/comparison-storage'
import prisma from '@/lib/prisma'

// Helper function to get or create user
async function getOrCreateUser(clerkId) {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        
        user = await prisma.user.create({
          data: {
            clerkId,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
            lastLogin: new Date()
          }
        });
        
        console.log('✅ Created new user in comparison:', user.id);
      } catch (clerkError) {
        console.error('Error fetching user from Clerk:', clerkError);
        user = await prisma.user.create({
          data: {
            clerkId,
            email: `user_${clerkId}@example.com`,
            lastLogin: new Date()
          }
        });
      }
    }

    return user;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Failed to get or create user');
  }
}

export async function createComparison(formData) {
  try {
    // Check authentication
    const { userId: clerkId } = await auth();
    console.log('🔑 Auth check - clerkId:', clerkId);
    if (!clerkId) {
      throw new Error('يجب تسجيل الدخول لإنشاء مقارنة');
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    // Extract form data - handle both JSON and individual fields
    let orientation1, orientation2, userProfile;
    
    // Try to get JSON data first (from new comparison tool)
    const orientation1Json = formData.get('orientation1');
    const orientation2Json = formData.get('orientation2');
    const userProfileJson = formData.get('userProfile');
    
    if (orientation1Json && orientation2Json && userProfileJson) {
      // Parse JSON data
      orientation1 = JSON.parse(orientation1Json);
      orientation2 = JSON.parse(orientation2Json);
      userProfile = JSON.parse(userProfileJson);
    } else {
      // Fall back to individual fields (legacy support)
      const orientation1Code = formData.get('orientation1');
      const orientation2Code = formData.get('orientation2');
      const bacScore = parseFloat(formData.get('bacScore'));
      const governorate = formData.get('governorate');

      if (!orientation1Code || !orientation2Code || !bacScore || !governorate) {
        throw new Error('All fields are required');
      }

      if (bacScore < 0 || bacScore > 200) {
        throw new Error('BAC score must be between 0 and 200');
      }

      // Find orientations by code
      orientation1 = getOrientationByCode(orientation1Code);
      orientation2 = getOrientationByCode(orientation2Code);

      if (!orientation1) {
        throw new Error(`Orientation with code "${orientation1Code}" not found`);
      }

      if (!orientation2) {
        throw new Error(`Orientation with code "${orientation2Code}" not found`);
      }

      userProfile = {
        score: bacScore,
        location: governorate,
        bacType: 'général'
      };
    }

    // Generate comparison ID
    const comparisonId = nanoid();

    // Create comparison data
    const comparisonData = {
      id: comparisonId,
      userId: user.id, // Use database user ID
      orientation1,
      orientation2,
      userProfile,
      createdAt: new Date().toISOString(),
      // We'll generate AI analysis separately for better performance
      aiAnalysis: null
    }

    // Store comparison in database
    const savedComparison = await comparisonStorage.create(comparisonData);
    
    return { success: true, comparisonId };
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
