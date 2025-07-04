import { prisma } from './prisma.js';

// Database connection test utility
export async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test query execution
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query execution successful:', result);
    
    // Test comparison table access
    const count = await prisma.comparison.count();
    console.log(`✅ Comparison table accessible. Current count: ${count}`);
    
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Provide specific error information
    let errorMessage = 'Unknown database error';
    
    if (error.message.includes('invalid port number')) {
      errorMessage = 'Invalid port number in database URL';
    } else if (error.message.includes('connection string')) {
      errorMessage = 'Invalid database connection string format';
    } else if (error.message.includes('authentication')) {
      errorMessage = 'Database authentication failed';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Database connection timeout';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      details: error.message,
      connectionString: process.env.DATABASE_URL ? 'Set' : 'Not set'
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Environment variables validation
export function validateDatabaseConfig() {
  const config = {
    DATABASE_URL: process.env.DATABASE_URL,
    PGHOST: process.env.PGHOST,
    PGUSER: process.env.PGUSER,
    PGPORT: process.env.PGPORT,
    PGDATABASE: process.env.PGDATABASE,
    PGPASSWORD: process.env.PGPASSWORD ? '***HIDDEN***' : undefined
  };
  
  console.log('🔍 Database configuration:');
  console.table(config);
  
  const missing = [];
  if (!process.env.DATABASE_URL) {
    if (!process.env.PGHOST) missing.push('PGHOST');
    if (!process.env.PGUSER) missing.push('PGUSER');
    if (!process.env.PGPORT) missing.push('PGPORT');
    if (!process.env.PGDATABASE) missing.push('PGDATABASE');
    if (!process.env.PGPASSWORD) missing.push('PGPASSWORD');
  }
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing);
    return false;
  }
  
  return true;
}
