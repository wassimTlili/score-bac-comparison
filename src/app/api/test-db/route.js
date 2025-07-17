import { prisma } from '../../../lib/prisma.js';

export async function GET() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test query execution
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query execution successful');
    
    // Test comparison table access
    const count = await prisma.comparison.count();
    console.log(`✅ Comparison table accessible. Current count: ${count}`);
    
    return Response.json({ 
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
