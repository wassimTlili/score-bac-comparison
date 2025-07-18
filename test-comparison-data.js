import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function testComparisonData() {
  try {
    console.log('🔍 Testing comparison data...');
    
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, clerkId: true, email: true, firstName: true }
    });
    console.log('👥 All users:', allUsers);
    
    // Get all comparisons
    const allComparisons = await prisma.comparison.findMany({
      select: { 
        id: true, 
        userId: true, 
        title: true, 
        createdAt: true,
        analysisStatus: true 
      }
    });
    console.log('📊 All comparisons:', allComparisons);
    
    // Check for current user
    const { userId: clerkId } = await auth();
    if (clerkId) {
      console.log('🔑 Current clerkId:', clerkId);
      
      const currentUser = await prisma.user.findUnique({
        where: { clerkId }
      });
      console.log('👤 Current user:', currentUser);
      
      if (currentUser) {
        const userComparisons = await prisma.comparison.findMany({
          where: { userId: currentUser.id }
        });
        console.log('📈 User comparisons:', userComparisons.length);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Test error:', error);
    return { success: false, error: error.message };
  }
}
