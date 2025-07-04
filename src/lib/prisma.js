import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Enhanced database URL construction with better error handling
function getDatabaseUrl() {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    console.warn('Prisma client should not be used in browser environment');
    return null;
  }
  
  const directUrl = process.env.DATABASE_URL;
  
  if (directUrl) {
    return directUrl;
  }
  
  // Fallback: construct from individual components
  const { PGHOST, PGUSER, PGPASSWORD, PGPORT, PGDATABASE } = process.env;
  
  if (!PGHOST || !PGUSER || !PGPASSWORD || !PGPORT || !PGDATABASE) {
    throw new Error('Missing required database environment variables');
  }
  
  // URL encode the password to handle special characters
  const encodedPassword = encodeURIComponent(PGPASSWORD);
  
  return `postgresql://${PGUSER}:${encodedPassword}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
}

// Only initialize Prisma client on server side
function createPrismaClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Prisma client cannot be used in browser environment');
  }
  
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error('Database URL not available');
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
