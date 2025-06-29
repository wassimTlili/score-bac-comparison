import { streamText } from 'ai';
import { openai } from '../../../lib/azure-ai.js';
import { CHATBOT_SYSTEM_PROMPT, createChatbotContext } from '../../../lib/prompts.js';
import { getComparison } from '../../../actions/comparison-actions.js';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request) {
  try {
    const { messages, comparisonId } = await request.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Invalid messages format:', typeof messages);
      return new Response('Invalid messages format', { status: 400 });
    }

    if (!comparisonId) {
      console.error('❌ Missing comparison ID');
      return new Response('Comparison ID is required', { status: 400 });
    }

    // Get comparison data
    const comparison = await getComparison(comparisonId);
    if (!comparison) {
      console.error('❌ Comparison not found:', comparisonId);
      return new Response('Comparison not found', { status: 404 });
    }

    // Create context for the chatbot
    const context = createChatbotContext(comparison);

    // Test Azure AI client before using it
    try {
      const testClient = openai('gpt-4o');
    } catch (clientError) {
      console.error('❌ Failed to create Azure AI client:', clientError);
      throw new Error(`Azure AI client error: ${clientError.message}`);
    }

    // Stream the AI response
    const result = await streamText({
      model: openai('gpt-4o'),
      system: `${CHATBOT_SYSTEM_PROMPT}\n\n${context}`,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });
    
    // Return the response in the format expected by useChat
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('❌ Chat API error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // More specific error handling
    if (error.message?.includes('Azure')) {
      console.error('❌ Azure configuration error detected');
      return new Response(
        JSON.stringify({ 
          error: 'Erreur de configuration Azure. Veuillez vérifier les paramètres.' 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (error.message?.includes('API')) {
      console.error('❌ API error detected');
      return new Response(
        JSON.stringify({ 
          error: 'Erreur de l\'API IA. Service temporairement indisponible.' 
        }), 
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Return generic error response
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors du traitement de votre message.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ 
      message: 'Chat API is running',
      version: '1.0.0',
      endpoints: {
        POST: 'Send chat messages with comparisonId and messages array'
      }
    }), 
    { 
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
