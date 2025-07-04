import { streamText } from 'ai';
import { openai } from '../../../lib/azure-ai.js';
import { CHATBOT_SYSTEM_PROMPT, createChatbotContext } from '../../../lib/prompts.js';
import { getComparison } from '../../../actions/comparison-actions.js';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request) {
  try {
    const { messages, comparisonId, isGeneralChat } = await request.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Invalid messages format:', typeof messages);
      return new Response('Invalid messages format', { status: 400 });
    }

    let context = '';
    let systemPrompt = CHATBOT_SYSTEM_PROMPT;

    if (isGeneralChat) {
      // General educational chatbot mode - use streaming
      systemPrompt = `Tu es un assistant éducatif spécialisé dans le système scolaire et universitaire tunisien. Tu aides les étudiants avec:

- L'orientation scolaire et universitaire  
- Les informations sur les filières BAC (Math, Sciences, Info, Tech, Eco, Lettres)
- Les calculs de scores et moyennes
- Les débouchés professionnels
- Les méthodes d'étude et de révision
- Les conseils pour réussir ses études
- Les informations sur les universités tunisiennes

Réponds de manière claire, utile et encourageante. Utilise des exemples concrets du système éducatif tunisien.`;

      console.log('🚀 Starting general chat stream generation...');
    } else if (comparisonId) {
      // Comparison-specific chat mode (streaming)
      console.log('🔍 Loading comparison for chat...');
      
      try {
        const comparison = await getComparison(comparisonId);
        
        if (!comparison) {
          console.error('❌ Comparison not found:', comparisonId);
          return new Response('Comparison not found', { status: 404 });
        }

        console.log('✅ Comparison loaded successfully');

        // Create context from comparison data
        context = createChatbotContext(comparison);
        console.log('📝 Context created, length:', context.length);

      } catch (error) {
        console.error('❌ Error loading comparison:', error);
        return new Response('Error loading comparison data', { status: 500 });
      }
    } else {
      return new Response('Either isGeneralChat or comparisonId must be provided', { status: 400 });
    }

    // Use streaming for both general chat and comparison chat
    try {
      console.log('🚀 Starting stream generation...');
      
      const result = await streamText({
        model: openai(process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4'),
        system: systemPrompt + (context ? `\n\nCONTEXT:\n${context}` : ''),
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        maxTokens: 2000,
        temperature: 0.7,
      });

      console.log('✅ Stream generation successful');
      return result.toDataStreamResponse();

    } catch (streamError) {
      console.error('❌ Stream generation error:', streamError);
      
      // Return error message as JSON for both types of chat
      return Response.json({ 
        message: "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants." 
      }, { status: 500 });
    }

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
