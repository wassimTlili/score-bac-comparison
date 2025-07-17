'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================================
// USER MANAGEMENT ACTIONS
// ============================================

/**
 * Get or create user from Clerk authentication
 */
export async function getOrCreateUser() {
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
    } else {
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error getting/creating user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(preferences) {
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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        preferredLanguage: preferences.preferredLanguage || user.preferredLanguage,
        theme: preferences.theme || user.theme,
        notifications: preferences.notifications ?? user.notifications
      }
    });

    revalidatePath('/profile');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user activity statistics
 */
export async function getUserActivityStats(userId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      comparisonsCreated: activities.filter(a => a.action === 'comparison_created').length,
      chatMessages: activities.filter(a => a.action === 'chat_message').length,
      pageViews: activities.filter(a => a.action === 'page_view').length,
      avgLoadTime: activities
        .filter(a => a.loadTime)
        .reduce((sum, a) => sum + a.loadTime, 0) / activities.filter(a => a.loadTime).length || 0
    };

    return { success: true, stats, activities };
  } catch (error) {
    console.error('Error getting user activity stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Track user activity
 */
export async function trackUserActivity({ action, page, data, sessionId, userAgent, ipAddress }) {
  try {
    const { userId: clerkId } = await auth();
    
    let userId = null;
    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true }
      });
      userId = user?.id;
    }

    await prisma.userActivity.create({
      data: {
        userId,
        action,
        page,
        data,
        sessionId,
        userAgent,
        ipAddress: ipAddress ? hashString(ipAddress) : null, // Hash IP for privacy
        createdAt: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking user activity:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to hash IP addresses for privacy
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}
