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
      // General educational chatbot mode - return JSON response instead of streaming
      systemPrompt = `Tu es un assistant éducatif spécialisé dans le système scolaire et universitaire tunisien. Tu aides les étudiants avec:

- L'orientation scolaire et universitaire  
- Les informations sur les filières BAC (Math, Sciences, Info, Tech, Eco, Lettres)
- Les calculs de scores et moyennes
- Les débouchés professionnels
- Les méthodes d'étude et de révision
- Les conseils pour réussir ses études
- Les informations sur les universités tunisiennes

Réponds de manière claire, utile et encourageante. Utilise des exemples concrets du système éducatif tunisien.`;

      try {
        const response = await openai.chat.completions.create({
          model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        const message = response.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";
        
        return Response.json({ message });
      } catch (error) {
        console.error('❌ General chat error:', error);
        return Response.json({ 
          message: "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants." 
        }, { status: 500 });
      }
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

    // For comparison chat, use streaming
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
      return result.toAIStreamResponse();

    } catch (streamError) {
      console.error('❌ Stream generation error:', streamError);
      
      // Fallback to non-streaming response
      try {
        console.log('🔄 Falling back to non-streaming...');
        
        const completion = await openai.chat.completions.create({
          model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt + (context ? `\n\nCONTEXT:\n${context}` : '') },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          max_tokens: 2000,
          temperature: 0.7
        });

        const assistantMessage = completion.choices[0]?.message?.content || 
          "Désolé, je rencontre des difficultés techniques. Veuillez réessayer.";

        return new Response(assistantMessage, {
          headers: { 'Content-Type': 'text/plain' }
        });

      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return new Response(
          "Désolé, je rencontre des problèmes techniques. Veuillez réessayer dans quelques instants.",
          { 
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
          }
        );
      }
    }

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Une erreur s\'est produite lors du traitement de votre demande',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
