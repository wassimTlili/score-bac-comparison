'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function debugComparisonCounts() {
  try {
    const { userId: clerkId } = await auth();
    console.log('🔍 Debug - Current clerkId:', clerkId);
    
    if (!clerkId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    console.log('👤 Debug - Found user:', user);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Count comparisons
    const totalComparisons = await prisma.comparison.count({
      where: { userId: user.id }
    });
    
    console.log('📊 Debug - Total comparisons for user:', totalComparisons);

    // Get all comparisons for debugging
    const allUserComparisons = await prisma.comparison.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        analysisStatus: true,
        userId: true
      }
    });
    
    console.log('📋 Debug - All user comparisons:', allUserComparisons);
    
    // Get total comparisons in database (all users)
    const totalAllComparisons = await prisma.comparison.count();
    console.log('🌍 Debug - Total comparisons in database:', totalAllComparisons);
    
    return {
      success: true,
      debug: {
        clerkId,
        userId: user.id,
        userEmail: user.email,
        totalComparisons,
        allUserComparisons,
        totalAllComparisons
      }
    };
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return { success: false, error: error.message };
  }
}
