'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================================
// USER PROFILE ACTIONS (Stepper Data)
// ============================================

/**
 * Create or update user profile from stepper data
 */
export async function createOrUpdateUserProfile(profileData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { clerkId }
    });

    // Create user if doesn't exist
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
        
        console.log('✅ Created new user:', user.id);
      } catch (clerkError) {
        console.error('Error fetching user from Clerk:', clerkError);
        // Create basic user record without Clerk data
        user = await prisma.user.create({
          data: {
            clerkId,
            email: `user_${clerkId}@example.com`, // Fallback email
            lastLogin: new Date()
          }
        });
      }
    }

    // Deactivate existing active profile
    await prisma.userProfile.updateMany({
      where: {
        userId: user.id,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // Create new active profile
    const profile = await prisma.userProfile.create({
      data: {
        userId: user.id,
        filiere: profileData.filiere,
        wilaya: profileData.wilaya,
        birthDate: formatBirthDate(profileData.birthDate || profileData.birthday),
        gender: profileData.gender,
        session: profileData.session,
        mgScore: profileData.mgScore,
        fsScore: profileData.fsScore,
        finalScore: profileData.finalScore,
        grades: profileData.grades || {},
        preferredRegions: profileData.preferredRegions || [],
        careerInterests: profileData.careerInterests || [],
        isActive: true,
        completedAt: new Date()
      }
    });

    revalidatePath('/profile');
    revalidatePath('/stepper');
    
    return { success: true, profile };
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's active profile
 */
export async function getUserProfile() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        profiles: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    // Create user if doesn't exist
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
          },
          include: {
            profiles: {
              where: { isActive: true },
              take: 1
            }
          }
        });
        
        console.log('✅ Created new user during profile fetch:', user.id);
      } catch (clerkError) {
        console.error('Error fetching user from Clerk:', clerkError);
        // Create basic user record without Clerk data
        user = await prisma.user.create({
          data: {
            clerkId,
            email: `user_${clerkId}@example.com`, // Fallback email
            lastLogin: new Date()
          },
          include: {
            profiles: {
              where: { isActive: true },
              take: 1
            }
          }
        });
      }
    }

    const profile = user.profiles[0] || null;
    return { success: true, profile };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user profile scores (after calculation)
 */
export async function updateProfileScores(scores) {
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

    const profile = await prisma.userProfile.findFirst({
      where: {
        userId: user.id,
        isActive: true
      }
    });

    if (!profile) {
      throw new Error('No active profile found');
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        mgScore: scores.mg,
        fsScore: scores.fs,
        finalScore: scores.fg || scores.fs
      }
    });

    revalidatePath('/profile');
    return { success: true, profile: updatedProfile };
  } catch (error) {
    console.error('Error updating profile scores:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user profile history
 */
export async function getUserProfileHistory() {
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

    const profiles = await prisma.userProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, profiles };
  } catch (error) {
    console.error('Error getting user profile history:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete user profile
 */
export async function deleteUserProfile(profileId) {
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

    // Verify profile belongs to user
    const profile = await prisma.userProfile.findFirst({
      where: {
        id: profileId,
        userId: user.id
      }
    });

    if (!profile) {
      throw new Error('Profile not found or access denied');
    }

    await prisma.userProfile.delete({
      where: { id: profileId }
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update profile preferences
 */
export async function updateProfilePreferences(preferences) {
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

    const profile = await prisma.userProfile.findFirst({
      where: {
        userId: user.id,
        isActive: true
      }
    });

    if (!profile) {
      throw new Error('No active profile found');
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        preferredRegions: preferences.preferredRegions || profile.preferredRegions,
        careerInterests: preferences.careerInterests || profile.careerInterests
      }
    });

    revalidatePath('/profile');
    return { success: true, profile: updatedProfile };
  } catch (error) {
    console.error('Error updating profile preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper function to ensure proper date formatting
 */
function formatBirthDate(birthDate) {
  if (!birthDate) return null;
  
  // If it's already a Date object, return it
  if (birthDate instanceof Date) {
    return birthDate;
  }
  
  // If it's a string, try to parse it
  if (typeof birthDate === 'string') {
    const parsed = new Date(birthDate);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}
