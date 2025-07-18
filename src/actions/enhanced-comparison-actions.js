'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateComparisonAnalysis } from './ai-comparison';

// ============================================
// ENHANCED COMPARISON ACTIONS
// ============================================

/**
 * Create comprehensive comparison with user profile integration
 */
export async function createEnhancedComparison({
  orientation1Id,
  orientation2Id,
  title,
  metadata = {}
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        profiles: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userProfile = user.profiles[0];

    // Validate orientations exist
    const [orientation1, orientation2] = await Promise.all([
      prisma.orientation.findUnique({
        where: { id: orientation1Id },
        include: {
          university: true,
          bacType: true,
          fieldOfStudy: true,
          institution: true
        }
      }),
      prisma.orientation.findUnique({
        where: { id: orientation2Id },
        include: {
          university: true,
          bacType: true,
          fieldOfStudy: true,
          institution: true
        }
      })
    ]);

    if (!orientation1 || !orientation2) {
      throw new Error('One or both orientations not found');
    }

    // Create comparison
    const comparison = await prisma.comparison.create({
      data: {
        userId: user.id,
        userProfileId: userProfile?.id,
        orientation1Id,
        orientation2Id,
        userScore: userProfile?.finalScore,
        userBacType: userProfile?.filiere,
        userLocation: userProfile?.wilaya,
        title: title || `${orientation1.specialization} vs ${orientation2.specialization}`,
        analysisStatus: 'pending',
        ...metadata
      },
      include: {
        orientation1: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        },
        orientation2: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        },
        userProfile: true
      }
    });

    // Generate AI analysis asynchronously
    generateComparisonAnalysisAsync(comparison.id);

    revalidatePath('/comparison');
    return { success: true, comparison };
  } catch (error) {
    console.error('Error creating enhanced comparison:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get comparison with full analysis
 */
export async function getComparisonWithAnalysis(comparisonId) {
  try {
    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId },
      include: {
        user: true,
        userProfile: true,
        orientation1: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        },
        orientation2: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        },
        conversations: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    if (!comparison) {
      throw new Error('Comparison not found');
    }

    // Increment view count
    await prisma.comparison.update({
      where: { id: comparisonId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return { success: true, comparison };
  } catch (error) {
    console.error('Error getting comparison with analysis:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's comparison history
 */
export async function getUserComparisons(options = {}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const {
      limit = 10,
      offset = 0,
      includeAnalysis = false
    } = options;

    const comparisons = await prisma.comparison.findMany({
      where: { userId: user.id },
      include: {
        orientation1: {
          include: {
            university: true,
            bacType: true
          }
        },
        orientation2: {
          include: {
            university: true,
            bacType: true
          }
        },
        ...(includeAnalysis && {
          conversations: {
            take: 1,
            orderBy: { lastMessageAt: 'desc' }
          }
        })
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.comparison.count({
      where: { userId: user.id }
    });

    return {
      success: true,
      comparisons,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit
      }
    };
  } catch (error) {
    console.error('Error getting user comparisons:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update comparison metadata
 */
export async function updateComparison(comparisonId, updates) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify ownership
    const comparison = await prisma.comparison.findFirst({
      where: {
        id: comparisonId,
        userId: user.id
      }
    });

    if (!comparison) {
      throw new Error('Comparison not found or access denied');
    }

    const updatedComparison = await prisma.comparison.update({
      where: { id: comparisonId },
      data: {
        title: updates.title !== undefined ? updates.title : comparison.title,
        summary: updates.summary !== undefined ? updates.summary : comparison.summary,
        isPublic: updates.isPublic !== undefined ? updates.isPublic : comparison.isPublic
      }
    });

    revalidatePath('/comparison');
    return { success: true, comparison: updatedComparison };
  } catch (error) {
    console.error('Error updating comparison:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete comparison
 */
export async function deleteComparison(comparisonId) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify ownership
    const comparison = await prisma.comparison.findFirst({
      where: {
        id: comparisonId,
        userId: user.id
      }
    });

    if (!comparison) {
      throw new Error('Comparison not found or access denied');
    }

    await prisma.comparison.delete({
      where: { id: comparisonId }
    });

    revalidatePath('/comparison');
    return { success: true };
  } catch (error) {
    console.error('Error deleting comparison:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Share comparison (generate share token)
 */
export async function shareComparison(comparisonId) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify ownership
    const comparison = await prisma.comparison.findFirst({
      where: {
        id: comparisonId,
        userId: user.id
      }
    });

    if (!comparison) {
      throw new Error('Comparison not found or access denied');
    }

    // Generate share token if doesn't exist
    let shareToken = comparison.shareToken;
    if (!shareToken) {
      shareToken = generateShareToken();
      
      await prisma.comparison.update({
        where: { id: comparisonId },
        data: {
          shareToken,
          isPublic: true
        }
      });
    }

    return { success: true, shareToken };
  } catch (error) {
    console.error('Error sharing comparison:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get shared comparison by token
 */
export async function getSharedComparison(shareToken) {
  try {
    const comparison = await prisma.comparison.findFirst({
      where: {
        shareToken,
        isPublic: true
      },
      include: {
        orientation1: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        },
        orientation2: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        }
      }
    });

    if (!comparison) {
      throw new Error('Shared comparison not found or not public');
    }

    // Increment view count
    await prisma.comparison.update({
      where: { id: comparison.id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return { success: true, comparison };
  } catch (error) {
    console.error('Error getting shared comparison:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate AI analysis asynchronously
 */
async function generateComparisonAnalysisAsync(comparisonId) {
  try {
    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId },
      include: {
        orientation1: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        },
        orientation2: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        },
        userProfile: true
      }
    });

    if (!comparison) {
      return;
    }

    // Update status to processing
    await prisma.comparison.update({
      where: { id: comparisonId },
      data: { analysisStatus: 'processing' }
    });

    // Generate AI analysis
    const analysis = await generateComparisonAnalysis(comparison);

    // Update comparison with analysis
    await prisma.comparison.update({
      where: { id: comparisonId },
      data: {
        aiAnalysis: analysis,
        analysisStatus: 'completed',
        analysisModel: analysis.modelUsed || 'gpt-4o',
        analysisTokens: analysis.totalTokens || 0,
        confidence: analysis.confidence || 0.8
      }
    });

    revalidatePath(`/comparison/${comparisonId}`);
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    
    // Update status to failed
    await prisma.comparison.update({
      where: { id: comparisonId },
      data: { analysisStatus: 'failed' }
    });
  }
}

/**
 * Get comparison statistics
 */
export async function getComparisonStats() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    console.log('🔍 Getting comparison stats for clerkId:', clerkId);

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    console.log('👤 Found user:', { id: user.id, email: user.email });

    // Debug: First check if table exists and has data
    const totalAllComparisons = await prisma.comparison.count();
    console.log('🌍 Total comparisons in database (all users):', totalAllComparisons);

    const [
      totalComparisons,
      completedAnalyses,
      favoriteComparisons,
      recentComparisons,
      popularOrientations
    ] = await Promise.all([
      prisma.comparison.count({
        where: { userId: user.id }
      }),
      
      prisma.comparison.count({
        where: {
          userId: user.id,
          analysisStatus: 'completed'
        }
      }),
      
      prisma.comparison.count({
        where: {
          userId: user.id,
          // Add favorite logic here if needed
        }
      }),
      
      prisma.comparison.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Simplified query that doesn't depend on orientations table
      []
    ]);

    console.log('📊 Comparison stats:', {
      totalComparisons,
      completedAnalyses,
      favoriteComparisons,
      recentComparisons: recentComparisons.length,
      totalAllComparisons
    });

    // If no comparisons found, check if there are comparisons with null userId
    if (totalComparisons === 0 && totalAllComparisons > 0) {
      const orphanedComparisons = await prisma.comparison.findMany({
        where: { userId: null },
        take: 5
      });
      console.log('� Found orphaned comparisons (null userId):', orphanedComparisons.length);
    }

    return {
      success: true,
      stats: {
        totalComparisons: totalComparisons,
        completedAnalyses: completedAnalyses,
        favorites: favoriteComparisons,
        recent: recentComparisons,
        popularOrientations
      }
    };
  } catch (error) {
    console.error('Error getting comparison stats:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to generate share token
function generateShareToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
