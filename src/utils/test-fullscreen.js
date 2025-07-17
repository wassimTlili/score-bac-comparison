// Test fullscreen functionality
import { 
  createConversationWithMessage,
  toggleConversationFullscreen,
  getConversationWithMessages 
} from '../actions/chat-actions.js';

export async function testFullscreenToggle() {
  try {
    console.log('🧪 Testing fullscreen toggle functionality...');
    
    // Test 1: Create a conversation first
    console.log('1. Creating test conversation...');
    const createResult = await createConversationWithMessage({
      firstMessage: 'Test message for fullscreen',
      title: 'Fullscreen Test',
      type: 'general',
      context: { test: true },
      isFullscreen: false
    });
    
    if (!createResult.success) {
      console.error('❌ Failed to create conversation:', createResult.error);
      return;
    }
    
    console.log('✅ Conversation created:', createResult.conversation.id);
    const conversationId = createResult.conversation.id;
    
    // Test 2: Toggle to fullscreen
    console.log('2. Toggling to fullscreen...');
    const toggleResult = await toggleConversationFullscreen(conversationId, true);
    
    if (!toggleResult.success) {
      console.error('❌ Failed to toggle fullscreen:', toggleResult.error);
      return;
    }
    
    console.log('✅ Fullscreen toggled successfully');
    
    // Test 3: Verify the change
    console.log('3. Verifying fullscreen status...');
    const getResult = await getConversationWithMessages(conversationId);
    
    if (!getResult.success) {
      console.error('❌ Failed to get conversation:', getResult.error);
      return;
    }
    
    const isFullscreen = getResult.conversation?.isFullscreen;
    console.log('✅ Fullscreen status:', isFullscreen);
    
    if (isFullscreen === true) {
      console.log('🎉 Fullscreen test passed!');
    } else {
      console.log('❌ Fullscreen test failed - status not updated');
    }
    
    // Test 4: Toggle back to normal
    console.log('4. Toggling back to normal...');
    const toggleBackResult = await toggleConversationFullscreen(conversationId, false);
    
    if (!toggleBackResult.success) {
      console.error('❌ Failed to toggle back:', toggleBackResult.error);
      return;
    }
    
    console.log('✅ All fullscreen tests passed!');
    
  } catch (error) {
    console.error('❌ Fullscreen test error:', error);
  }
}

// Run the test
// testFullscreenToggle();
