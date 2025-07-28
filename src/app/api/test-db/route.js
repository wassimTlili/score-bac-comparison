import { prisma } from '../../../lib/prisma.js';

export async function GET() {
  try {// Test basic connection
    await prisma.$connect();// Test query execution
    const result = await prisma.$queryRaw`SELECT 1 as test`;// Test comparison table access
    const count = await prisma.comparison.count();return Response.json({ 
      success: true, 
      message: 'Database connection successful',
      comparisonCount: count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    return Response.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}
