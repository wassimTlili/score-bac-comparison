'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageCircle, X, Minimize2, Send, Plus, 
  Clock, Trash2, ArrowLeft, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageFormatter from '@/components/MessageFormatter';
import { useFloatingNexie } from '@/context/FloatingNexieContext';
import {
  createConversationWithMessage,
  getUserConversations,
  getConversationWithMessages,
  deleteConversation
} from '@/actions/chat-actions';

export default function ChatbotPage() {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUserMessageRef = useRef(null);
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get('conversation');
  
  // Get persistent conversation state from FloatingNexieContext
  const { 
    persistentConversationId, 
    persistentMessages, 
    updatePersistentConversation, 
    clearPersistentConversation 
  } = useFloatingNexie();

  // Default welcome message
  const defaultWelcomeMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `مرحباً بك في نيكسي! أنا مساعدك الذكي المتخصص في التوجيه الجامعي في تونس.

🎓 **يمكنني مساعدتك في:**
• اختيار التخصص المناسب حسب معدلك وميولك
• تحليل فرص القبول في الجامعات المختلفة
• مقارنة البرامج الأكاديمية والتخصصات
• وضع استراتيجية تسجيل ذكية
• فهم متطلبات القبول والشروط
• نصائح للتحضير للدراسة الجامعية

💡 **نصيحة:** يمكنك مشاركة معدلك ونوع الباك لأحصل على نصائح مخصصة لك!

كيف يمكنني مساعدتك اليوم؟`
  };

  // Determine initial messages based on persistent state
  const getInitialMessages = () => {
    if (persistentMessages && persistentMessages.length > 0) {
      // Clean persistent messages to ensure they're properly formatted
      return persistentMessages.map(msg => ({
        id: msg.id || Date.now().toString(),
        role: msg.role || 'assistant',
        content: typeof msg.content === 'string' ? msg.content : String(msg.content || ''),
        createdAt: msg.createdAt || new Date().toISOString()
      }));
    }
    return [defaultWelcomeMessage];
  };

  // Chat hook with dynamic conversation handling
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit: originalHandleSubmit, 
    isLoading, 
    setMessages,
    reload 
  } = useChat({
    api: '/api/chat',
    body: {
      conversationId: currentConversationId || persistentConversationId,
      isGeneralChat: true,
      context: { fullscreen: true }
    },
    initialMessages: getInitialMessages(),
    onFinish: async (message) => {
      // Clean and update persistent conversation state
      const updatedMessages = [...messages, message];
      
      console.log('📝 Raw message in onFinish:', message);
      console.log('📝 Message content type:', typeof message.content);
      console.log('📝 Message content:', message.content);
      
      // Clean messages to prevent [object Object] issues
      const cleanedMessages = updatedMessages.map(msg => {
        let content;
        
        if (typeof msg.content === 'string') {
          content = msg.content;
        } else if (typeof msg.content === 'object' && msg.content !== null) {
          try {
            content = JSON.stringify(msg.content);
          } catch (e) {
            content = String(msg.content);
          }
        } else {
          content = String(msg.content || '');
        }
        
        return {
          id: msg.id || Date.now().toString(),
          role: msg.role || 'assistant',
          content: content,
          createdAt: msg.createdAt || new Date().toISOString()
        };
      });
      
      console.log('📝 Cleaned messages:', cleanedMessages);
      
      updatePersistentConversation(currentConversationId || persistentConversationId, cleanedMessages);
      
      // Save conversation to database if this is the first user message and we don't have a conversation yet
      if (!currentConversationId && !persistentConversationId) {
        try {
          console.log('🔄 onFinish called, creating conversation...');
          console.log('Stored user message:', currentUserMessageRef.current);
          
          // Use the stored message content
          const messageText = currentUserMessageRef.current || 'New conversation';
          
          console.log('Using message text:', messageText);
          
          const result = await createConversationWithMessage({
            firstMessage: messageText,
            title: messageText.substring(0, 50) + '...',
            type: 'general',
            context: { fullscreen: true },
            isFullscreen: true
          });
          
          console.log('Create conversation result:', result);
          
          if (result.success && result.conversation) {
            console.log('✅ Conversation created with ID:', result.conversation.id);
            setCurrentConversationId(result.conversation.id);
            // Update persistent state with the new conversation ID and current messages
            updatePersistentConversation(result.conversation.id, cleanedMessages);
          } else {
            console.error('❌ Failed to create conversation:', result.error);
          }
        } catch (error) {
          console.error('Error creating conversation:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  // Custom handle submit to capture the message
  const handleSubmit = (e) => {
    e?.preventDefault();
    // Store the current input value before submission
    currentUserMessageRef.current = input;
    console.log('📝 Storing user message:', input);
    
    // Don't manually add user message here - let useChat handle it
    // This prevents duplicate messages
    
    // Call the original handle submit
    originalHandleSubmit(e);
  };

  // Load conversation history
  const loadConversations = async () => {
    setIsLoadingHistory(true);
    try {
      const result = await getUserConversations(1, 50);
      if (result.success) {
        setConversations(result.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    setIsLoadingHistory(false);
  };

  // Load specific conversation
  const loadConversation = async (convId) => {
    try {
      const result = await getConversationWithMessages(convId);
      if (result.success && result.conversation) {
        const conversation = result.conversation;
        const formattedMessages = conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }));
        
        setMessages(formattedMessages);
        setCurrentConversationId(convId);
        setShowHistory(false);
      } else {
        console.error('Conversation not found or invalid');
        // Start new conversation if conversation not found
        startNewConversation();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Start new conversation on error
      startNewConversation();
    }
  };

  // Start new conversation
  const startNewConversation = () => {
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `مرحباً بك في نيكسي! أنا مساعدك الذكي المتخصص في التوجيه الجامعي في تونس.

🎓 **يمكنني مساعدتك في:**
• اختيار التخصص المناسب حسب معدلك وميولك
• تحليل فرص القبول في الجامعات المختلفة
• مقارنة البرامج الأكاديمية والتخصصات
• وضع استراتيجية تسجيل ذكية
• فهم متطلبات القبول والشروط
• نصائح للتحضير للدراسة الجامعية

💡 **نصيحة:** يمكنك مشاركة معدلك ونوع الباك لأحصل على نصائح مخصصة لك!

كيف يمكنني مساعدتك اليوم؟`
    };
    
    setMessages([welcomeMessage]);
    setCurrentConversationId(null);
    setShowHistory(false);
    
    // Clear persistent conversation state
    clearPersistentConversation();
  };

  // Delete conversation
  const handleDeleteConversation = async (convId) => {
    try {
      const result = await deleteConversation(convId);
      if (result.success) {
        setConversations(prev => prev.filter(c => c.id !== convId));
        if (convId === currentConversationId) {
          startNewConversation();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation state from persistent state
  useEffect(() => {
    if (persistentConversationId && !currentConversationId) {
      setCurrentConversationId(persistentConversationId);
    }
  }, [persistentConversationId, currentConversationId]);

  // Load conversations when history is opened
  useEffect(() => {
    if (showHistory) {
      loadConversations();
    }
  }, [showHistory]);

  // Load conversation from URL parameter
  useEffect(() => {
    if (conversationParam && conversationParam !== 'null' && conversationParam !== null) {
      loadConversation(conversationParam);
    }
  }, [conversationParam]);

  // Update URL when conversation is created
  useEffect(() => {
    if (currentConversationId && !conversationParam) {
      console.log('🔄 Updating URL with conversation ID:', currentConversationId);
      const newUrl = `/chatbot?conversation=${currentConversationId}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [currentConversationId, conversationParam]);

  // Suggested questions for new conversations
  const suggestedQuestions = [
    "كيف أختار التخصص المناسب لمعدلي؟",
    "ما هي أفضل استراتيجيات التسجيل الجامعي؟",
    "كيف أحسب فرص قبولي في الجامعات؟",
    "ما الفرق بين الجامعات الحكومية والخاصة؟",
    "كيف أقارن بين التخصصات المختلفة؟",
    "ما هي متطلبات القبول في الكليات الطبية؟"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                نيكسي - المساعد الذكي
              </h1>
              <p className="text-sm text-gray-400">مساعدك المتخصص في التوجيه الجامعي</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className={`text-gray-400 hover:text-cyan-400 hover:bg-slate-700/50 transition-all duration-200 ${showHistory ? 'bg-slate-700/50 text-cyan-400' : ''}`}
          >
            <Clock className="w-4 h-4 mr-2" />
            المحادثات السابقة
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={startNewConversation}
            className="text-gray-400 hover:text-cyan-400 hover:bg-slate-700/50 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            محادثة جديدة
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - History */}
        {showHistory && (
          <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="font-semibold text-white">المحادثات السابقة</h3>
              <p className="text-sm text-gray-400 mt-1">اختر محادثة للمتابعة</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group hover:shadow-md ${
                        conv.id === currentConversationId
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-lg'
                          : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50'
                      }`}
                      onClick={() => loadConversation(conv.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {conv.title || 'محادثة جديدة'}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {conv.messages[0]?.content?.substring(0, 80)}...
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString('ar')}
                            </p>
                            <span className="text-xs text-gray-400 bg-slate-600/50 px-2 py-1 rounded-full">
                              {conv._count?.messages || conv.messageCount || 0} رسالة
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          className="text-gray-400 hover:text-red-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">لا توجد محادثات سابقة</p>
                  <p className="text-sm text-gray-500 mt-1">ابدأ محادثة جديدة للحصول على المساعدة</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-900/50">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-4xl rounded-2xl px-6 py-4 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-slate-800/80 backdrop-blur-sm text-gray-100 border border-slate-700/50'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <MessageFormatter content={message.content} />
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                  {message.createdAt && (
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleString('ar')}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-6 py-4 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-700/50 p-6 bg-slate-800/30 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="اكتب رسالتك هنا..."
                disabled={isLoading}
                className="flex-1 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                dir="rtl"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            
            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-3">أسئلة مقترحة:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Store the question and trigger submission
                        currentUserMessageRef.current = question;
                        handleInputChange({ target: { value: question } });
                        // Use setTimeout to ensure the input is set before submission
                        setTimeout(() => {
                          handleSubmit();
                        }, 0);
                      }}
                      className="text-sm border-slate-600/50 bg-slate-800/30 text-gray-300 hover:bg-slate-700/50 hover:border-cyan-500/50 justify-start h-auto py-2 px-3 transition-all duration-200"
                      dir="rtl"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
