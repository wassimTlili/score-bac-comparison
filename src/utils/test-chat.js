// Test file for chat functionality
// This file can be used to test all chat functions manually

import { 
  createConversationWithMessage,
  getUserConversations,
  getConversationWithMessages,
  addMessageToConversation,
  toggleConversationFullscreen,
  deleteConversation
} from '@/actions/chat-actions';

// Test functions
export async function testChatFunctions() {
  console.log('=== Testing Chat Functions ===');

  try {
    // Test 1: Create conversation
    console.log('1. Testing createConversationWithMessage...');
    const createResult = await createConversationWithMessage('Test message');
    console.log('Create result:', createResult);
    
    if (!createResult.success) {
      console.error('❌ Failed to create conversation:', createResult.error);
      return;
    }

    const conversationId = createResult.conversation.id;
    console.log('✅ Conversation created:', conversationId);

    // Test 2: Get user conversations
    console.log('2. Testing getUserConversations...');
    const conversationsResult = await getUserConversations(10, 0);
    console.log('Conversations result:', conversationsResult);
    
    if (!conversationsResult.success) {
      console.error('❌ Failed to get conversations:', conversationsResult.error);
      return;
    }
    console.log('✅ Got conversations:', conversationsResult.conversations.length);

    // Test 3: Get conversation with messages
    console.log('3. Testing getConversationWithMessages...');
    const conversationResult = await getConversationWithMessages(conversationId);
    console.log('Conversation result:', conversationResult);
    
    if (!conversationResult.success) {
      console.error('❌ Failed to get conversation:', conversationResult.error);
      return;
    }
    console.log('✅ Got conversation with messages:', conversationResult.conversation.messages.length);

    // Test 4: Add message
    console.log('4. Testing addMessageToConversation...');
    const addMessageResult = await addMessageToConversation(conversationId, 'Test reply', 'assistant');
    console.log('Add message result:', addMessageResult);
    
    if (!addMessageResult.success) {
      console.error('❌ Failed to add message:', addMessageResult.error);
      return;
    }
    console.log('✅ Message added successfully');

    // Test 5: Toggle fullscreen
    console.log('5. Testing toggleConversationFullscreen...');
    const toggleResult = await toggleConversationFullscreen(conversationId, true);
    console.log('Toggle result:', toggleResult);
    
    if (!toggleResult.success) {
      console.error('❌ Failed to toggle fullscreen:', toggleResult.error);
      return;
    }
    console.log('✅ Fullscreen toggled successfully');

    // Test 6: Delete conversation
    console.log('6. Testing deleteConversation...');
    const deleteResult = await deleteConversation(conversationId);
    console.log('Delete result:', deleteResult);
    
    if (!deleteResult.success) {
      console.error('❌ Failed to delete conversation:', deleteResult.error);
      return;
    }
    console.log('✅ Conversation deleted successfully');

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Usage: Call this function in a React component or page to test
// testChatFunctions();
