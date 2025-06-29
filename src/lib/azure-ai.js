import { createAzure } from '@ai-sdk/azure';

if (!process.env.AZURE_OPENAI_API_KEY) {
  throw new Error('AZURE_OPENAI_API_KEY environment variable is required');
}

if (!process.env.AZURE_OPENAI_TARGET) {
  throw new Error('AZURE_OPENAI_TARGET environment variable is required');
}

if (!process.env.AZURE_OPENAI_CHAT_DEPLOYMENT) {
  throw new Error('AZURE_OPENAI_CHAT_DEPLOYMENT environment variable is required');
}

// Extract the resource name from the target URL
// AZURE_OPENAI_TARGET format: https://nextgen-brazil-south.openai.azure.com
const resourceName = process.env.AZURE_OPENAI_TARGET
  .replace('https://', '')
  .replace('.openai.azure.com/openai/deployments', '')
  .replace('.openai.azure.com', '');

// Create Azure provider for AI SDK
const azure = createAzure({
  resourceName: resourceName,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: '2024-02-01'  // Use stable API version
});

// Export openai function that uses the chat deployment
export const openai = (modelName) => {
  // Map generic model names to actual deployment names
  const deploymentMap = {
    'gpt-4o': process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
    'gpt-4': process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
    'gpt-4.1': process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
    'gpt-35-turbo': process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
  };
  
  const deployment = deploymentMap[modelName] || process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
  return azure(deployment);
};

// Export the azure instance as client for backwards compatibility
export const client = azure;
export default azure;
