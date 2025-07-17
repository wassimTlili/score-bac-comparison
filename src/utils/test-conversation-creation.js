// Test conversation creation directly
import { createConversationWithMessage } from '../actions/chat-actions.js';

export async function testConversationCreation() {
  console.log('🧪 Testing conversation creation...');
  
  try {
    const result = await createConversationWithMessage({
      firstMessage: 'Test message from fullscreen',
      title: 'Test conversation',
      type: 'general',
      context: { fullscreen: true },
      isFullscreen: true
    });
    
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ Conversation created successfully!');
      console.log('Conversation ID:', result.conversation.id);
      console.log('URL should be: /chatbot?conversation=' + result.conversation.id);
      return result.conversation.id;
    } else {
      console.error('❌ Failed to create conversation:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing conversation creation:', error);
    return null;
  }
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  window.testConversationCreation = testConversationCreation;
}
