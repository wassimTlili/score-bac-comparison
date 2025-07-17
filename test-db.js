// Simple database connection test
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible, count: ${userCount}`);
    
    // Test conversation table
    const conversationCount = await prisma.conversation.count();
    console.log(`✅ Conversation table accessible, count: ${conversationCount}`);
    
    // Test message table
    const messageCount = await prisma.message.count();
    console.log(`✅ Message table accessible, count: ${messageCount}`);
    
    console.log('✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    if (error.code === 'P1001') {
      console.error('❌ Can\'t reach database server');
    } else if (error.code === 'P1002') {
      console.error('❌ Database server was reached but timed out');
    } else if (error.code === 'P1003') {
      console.error('❌ Database does not exist');
    } else if (error.code === 'P1008') {
      console.error('❌ Operations timed out');
    } else if (error.code === 'P1009') {
      console.error('❌ Database already exists');
    } else if (error.code === 'P1010') {
      console.error('❌ User was denied access');
    } else if (error.code === 'P1011') {
      console.error('❌ Error opening a TLS connection');
    } else if (error.code === 'P1012') {
      console.error('❌ Schema is empty');
    } else if (error.code === 'P1013') {
      console.error('❌ Invalid database string');
    } else if (error.code === 'P1014') {
      console.error('❌ Underlying kind for model does not exist');
    } else if (error.code === 'P1015') {
      console.error('❌ Your Prisma schema is using features that are not supported');
    } else if (error.code === 'P1016') {
      console.error('❌ Your raw query had an incorrect number of parameters');
    } else if (error.code === 'P1017') {
      console.error('❌ Server has closed the connection');
    } else {
      console.error('❌ Unknown database error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
