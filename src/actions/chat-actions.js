'use server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getOrCreateUser } from '@/actions/user-actions';

// Create a new conversation with the first message
export async function createConversationWithMessage(message) {
  try {
    console.log('=== Creating conversation with message ===');
    console.log('Message type:', typeof message);
    console.log('Message:', message);
    
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    console.log('Clerk ID:', clerkId);

    // Get or create user in database
    const userResult = await getOrCreateUser();
    if (!userResult.success) {
      throw new Error(`Failed to get user: ${userResult.error}`);
    }

    const user = userResult.user;
    console.log('Database User ID:', user.id);

    // Robust message content extraction with multiple fallbacks
    let messageContent;
    
    if (typeof message === 'string') {
      messageContent = message;
    } else if (message && typeof message === 'object') {
      messageContent = message.content || message.text || message.message || String(message);
    } else {
      messageContent = 'New conversation';
    }
    
    // Ensure we have a valid string
    if (!messageContent || typeof messageContent !== 'string') {
      messageContent = 'New conversation';
    }
    
    // Safety check for substring operation
    const safeSubstring = (str, start, end) => {
      if (typeof str !== 'string') return 'New conversation';
      try {
        return str.substring(start, end);
      } catch (e) {
        return 'New conversation';
      }
    };
    
    const title = safeSubstring(messageContent, 0, 50) + (messageContent.length > 50 ? '...' : '');
    
    console.log('Final message content:', messageContent);
    console.log('Title:', title);
    
    // Create conversation with first message using database user ID
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id, // Use database user ID, not Clerk ID
        title: title,
        messages: {
          create: {
            content: messageContent,
            role: 'user',
          }
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    console.log('=== Conversation created successfully ===');
    console.log('Conversation ID:', conversation.id);
    return { success: true, conversation };

  } catch (error) {
    console.error('=== Error creating conversation ===');
    console.error('Error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to create conversation: ${error.message}`);
  }
}

// Get user conversations with pagination
export async function getUserConversations(limit = 10, offset = 0) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const userResult = await getOrCreateUser();
    if (!userResult.success) {
      throw new Error(`Failed to get user: ${userResult.error}`);
    }

    const user = userResult.user;

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id }, // Use database user ID
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return { success: true, conversations };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: error.message, conversations: [] };
  }
}

// Get conversation with all messages
export async function getConversationWithMessages(conversationId) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Validate conversationId
    if (!conversationId || conversationId === 'null' || conversationId === null) {
      throw new Error('Invalid conversation ID');
    }

    // Get or create user in database
    const userResult = await getOrCreateUser();
    if (!userResult.success) {
      throw new Error(`Failed to get user: ${userResult.error}`);
    }

    const user = userResult.user;

    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: user.id // Use database user ID
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return { success: true, conversation };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { success: false, error: error.message };
  }
}

// Add message to existing conversation
export async function addMessageToConversation(conversationId, content, role = 'user') {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const userResult = await getOrCreateUser();
    if (!userResult.success) {
      throw new Error(`Failed to get user: ${userResult.error}`);
    }

    const user = userResult.user;

    const message = await prisma.message.create({
      data: {
        content,
        role,
        type: 'text',
        conversationId
      }
    });

    // Update conversation timestamp and message count
    await prisma.conversation.update({
      where: { 
        id: conversationId,
        userId: user.id // Use database user ID
      },
      data: { 
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: {
          increment: 1
        }
      }
    });

    return { success: true, message };
  } catch (error) {
    console.error('Error adding message:', error);
    return { success: false, error: error.message };
  }
}

// Toggle conversation fullscreen mode
export async function toggleConversationFullscreen(conversationId, isFullscreen) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const userResult = await getOrCreateUser();
    if (!userResult.success) {
      throw new Error(`Failed to get user: ${userResult.error}`);
    }

    const user = userResult.user;

    // Update the conversation's fullscreen status directly
    await prisma.conversation.update({
      where: { 
        id: conversationId,
        userId: user.id // Ensure user owns the conversation
      },
      data: {
        isFullscreen: isFullscreen
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error toggling fullscreen:', error);
    return { success: false, error: error.message };
  }
}

// Delete conversation
export async function deleteConversation(conversationId) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('User not authenticated');
    }

    // Get or create user in database
    const userResult = await getOrCreateUser();
    if (!userResult.success) {
      throw new Error(`Failed to get user: ${userResult.error}`);
    }

    const user = userResult.user;

    await prisma.conversation.delete({
      where: { 
        id: conversationId,
        userId: user.id // Use database user ID
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return { success: false, error: error.message };
  }
}
