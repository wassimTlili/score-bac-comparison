// Test Azure AI connection
import { openai } from '../lib/azure-ai.js';

export async function testAzureConnection() {
  try {
    console.log('🧪 Testing Azure AI connection...');
    console.log('Environment variables:', {
      hasApiKey: !!process.env.AZURE_OPENAI_API_KEY,
      hasTarget: !!process.env.AZURE_OPENAI_TARGET,
      hasDeployment: !!process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
      deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT
    });

    const model = openai('gpt-4o');
    console.log('✅ Model created successfully');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Azure connection test failed:', error);
    return { success: false, error: error.message };
  }
}
