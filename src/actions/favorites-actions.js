'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper function to get or create user
async function getOrCreateUser(clerkId) {
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
      
      console.log('✅ Created new user in favorites:', user.id);
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
}

// ============================================
// FAVORITES MANAGEMENT ACTIONS
// ============================================

/**
 * Add orientation to user's favorites
 */
export async function addToFavorites(orientationId, metadata = {}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    // Get user's active profile
    const profile = await prisma.userProfile.findFirst({
      where: {
        userId: user.id,
        isActive: true
      }
    });

    // Check if orientation exists
    const orientation = await prisma.orientation.findUnique({
      where: { id: orientationId }
    });

    if (!orientation) {
      throw new Error('Orientation not found');
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_orientationId: {
          userId: user.id,
          orientationId
        }
      }
    });

    if (existingFavorite) {
      return { success: false, error: 'Already in favorites' };
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        userProfileId: profile?.id,
        orientationId,
        notes: metadata.notes,
        priority: metadata.priority,
        tags: metadata.tags || [],
        reason: metadata.reason
      },
      include: {
        orientation: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        }
      }
    });

    revalidatePath('/favorites');
    revalidatePath('/orientations');
    
    return { success: true, favorite };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove orientation from user's favorites
 */
export async function removeFromFavorites(orientationId) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    // Find and delete favorite
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_orientationId: {
          userId: user.id,
          orientationId
        }
      }
    });

    if (!favorite) {
      return { success: false, error: 'Not in favorites' };
    }

    await prisma.favorite.delete({
      where: { id: favorite.id }
    });

    revalidatePath('/favorites');
    revalidatePath('/orientations');
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's favorite orientations
 */
export async function getUserFavorites(limit = 50, offset = 0) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        orientation: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.favorite.count({
      where: { userId: user.id }
    });

    return { 
      success: true, 
      favorites, 
      totalCount,
      hasMore: offset + limit < totalCount
    };
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update favorite metadata
 */
export async function updateFavorite(orientationId, updates) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    // Find favorite
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_orientationId: {
          userId: user.id,
          orientationId
        }
      }
    });

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    // Update favorite
    const updatedFavorite = await prisma.favorite.update({
      where: { id: favorite.id },
      data: {
        notes: updates.notes ?? favorite.notes,
        priority: updates.priority ?? favorite.priority,
        tags: updates.tags ?? favorite.tags,
        reason: updates.reason ?? favorite.reason,
        applicationStatus: updates.applicationStatus ?? favorite.applicationStatus,
        applicationDate: updates.applicationDate ? new Date(updates.applicationDate) : favorite.applicationDate
      },
      include: {
        orientation: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        }
      }
    });

    revalidatePath('/favorites');
    
    return { success: true, favorite: updatedFavorite };
  } catch (error) {
    console.error('Error updating favorite:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if orientation is favorited by user
 */
export async function isFavorited(orientationId) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: true, isFavorited: false };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return { success: true, isFavorited: false };
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_orientationId: {
          userId: user.id,
          orientationId
        }
      }
    });

    return { success: true, isFavorited: !!favorite };
  } catch (error) {
    console.error('Error checking if favorited:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get favorites by tags
 */
export async function getFavoritesByTag(tag) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
        tags: {
          array_contains: [tag]
        }
      },
      include: {
        orientation: {
          include: {
            university: true,
            bacType: true,
            fieldOfStudy: true,
            institution: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, favorites };
  } catch (error) {
    console.error('Error getting favorites by tag:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all user's favorite tags
 */
export async function getUserFavoriteTags() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { tags: true }
    });

    // Extract unique tags
    const allTags = favorites.flatMap(f => f.tags || []);
    const uniqueTags = [...new Set(allTags)];

    return { success: true, tags: uniqueTags };
  } catch (error) {
    console.error('Error getting user favorite tags:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk update favorite priorities
 */
export async function updateFavoritePriorities(updates) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    // Use transaction for bulk updates
    await prisma.$transaction(
      updates.map(({ orientationId, priority }) =>
        prisma.favorite.updateMany({
          where: {
            userId: user.id,
            orientationId
          },
          data: {
            priority
          }
        })
      )
    );

    revalidatePath('/favorites');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating favorite priorities:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// SIMPLIFIED FAVORITES FOR JSON DATA (finale-data.json)
// ============================================

/**
 * Add orientation code to user's favorites (for JSON data)
 */
export async function addToFavoritesByCode(orientationCode) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    console.log('🔍 Adding to favorites:', { clerkId, orientationCode });

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    // Get user's active profile
    const profile = await prisma.userProfile.findFirst({
      where: {
        userId: user.id,
        isActive: true
      }
    });

    console.log('🔍 User and profile:', { userId: user.id, profileId: profile?.id });

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        orientationCode: orientationCode
      }
    });

    if (existingFavorite) {
      console.log('⚠️ Already in favorites');
      return { success: false, error: 'Already in favorites' };
    }

    // Create favorite with orientation code
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        userProfileId: profile?.id,
        orientationCode: orientationCode,
        createdAt: new Date()
      }
    });

    console.log('✅ Added to favorites:', favorite);
    revalidatePath('/recommendations');
    
    return { success: true, favorite };
  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove orientation code from user's favorites
 */
export async function removeFromFavoritesByCode(orientationCode) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    console.log('🔍 Removing from favorites:', { clerkId, orientationCode });

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    // Find and delete favorite
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        orientationCode: orientationCode
      }
    });

    if (!favorite) {
      console.log('⚠️ Not in favorites');
      return { success: false, error: 'Not in favorites' };
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id
      }
    });

    console.log('✅ Removed from favorites');
    revalidatePath('/recommendations');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's favorite orientation codes
 */
export async function getUserFavoritesByCode() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const user = await getOrCreateUser(clerkId);

    // Get user's favorites with orientation codes
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
        orientationCode: {
          not: null
        }
      },
      select: {
        orientationCode: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('🔍 Retrieved favorites:', favorites);
    
    return { success: true, favorites };
  } catch (error) {
    console.error('❌ Error getting favorites:', error);
    return { success: false, error: error.message };
  }
}
