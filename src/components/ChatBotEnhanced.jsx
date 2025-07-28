'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { 
  MessageCircle, X, Maximize2, Minimize2, Send, 
  RotateCcw, Settings, Plus, Trash2, Clock, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageFormatter from '@/components/MessageFormatter';
import { useFloatingNexie } from '@/context/FloatingNexieContext';
import {
  createConversationWithMessage,
  getUserConversations,
  getConversationWithMessages,
  toggleConversationFullscreen,
  deleteConversation
} from '@/actions/chat-actions';

export default function ChatBotEnhanced({ 
  isOpen, 
  onToggle, 
  isFullscreen = false, 
  conversationId = null,
  initialContext = {},
  mode = 'widget',
  onClose
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Generate context-aware initial message
  const getInitialMessage = () => {
    if (initialContext?.context === 'recommendations') {
      return `مرحباً! أنا نيكسي، مساعدك الذكي للتوجيه الجامعي 🎓

أرى أنك تتصفح التوصيات المخصصة لك. إليك تحليل سريع:

📊 **معدلك العام**: ${initialContext.mg?.toFixed(2) || 'غير محسوب'}
🎯 **نقاطك**: ${initialContext.fs?.toFixed(2) || 'غير محسوب'}
📍 **ولايتك**: ${initialContext.wilaya || 'غير محدد'}
📚 **شعبتك**: ${initialContext.filiere || 'غير محدد'}

يمكنني مساعدتك في:
• **فهم التوصيات**: لماذا يناسبك تخصص معين؟
• **تحليل الفرص**: ما هي احتمالات قبولك؟
• **معلومات الجامعات**: تفاصيل الأقطاب والمؤسسات
• **نصائح التحسين**: كيف تزيد من فرصك؟
• **المقارنة بين التخصصات**: أيهما أفضل لك؟

ما الذي تريد أن تعرفه حول توجهك الجامعي؟`;
    }
    
    if (initialContext?.context === 'comparison-dashboard') {
      return `مرحباً! أنا نيكسي، مساعد المقارنة الذكي 🔍

أرى أنك تستخدم أداة المقارنة. إليك ملخص وضعك:

📊 **معدلك**: ${initialContext.mg?.toFixed(2) || 'غير محسوب'}
🎯 **نقاطك**: ${initialContext.fs?.toFixed(2) || 'غير محسوب'}
📍 **ولايتك**: ${initialContext.wilaya || 'غير محدد'}
📚 **شعبتك**: ${initialContext.filiere || 'غير محدد'}

يمكنني مساعدتك في:
• **مقارنة التخصصات**: أيهما أفضل لك؟
• **تحليل الفرص**: ما هي احتمالات قبولك؟
• **اختيار الجامعات**: أفضل الخيارات لك
• **استراتيجية التسجيل**: كيف ترتب اختياراتك؟
• **نصائح التحسين**: كيف تزيد من فرصك؟

كيف يمكنني مساعدتك في اتخاذ القرار الأفضل؟`;
    }
    
    return `مرحباً! أنا نيكسي، مساعدك الذكي في التوجيه الجامعي. يمكنني مساعدتك في:

• اختيار التخصص المناسب
• تحليل فرص القبول  
• مقارنة البرامج الجامعية
• استراتيجيات التسجيل
• نصائح أكاديمية

كيف يمكنني مساعدتك اليوم؟`;
  };

  // Get persistent conversation state from context
  const { 
    persistentConversationId, 
    persistentMessages, 
    updatePersistentConversation,
    clearPersistentConversation 
  } = useFloatingNexie();

  // Chat hook with dynamic conversation handling
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    setMessages,
    reload 
  } = useChat({
    api: '/api/chat',
    body: {
      conversationId: currentConversationId,
      isGeneralChat: true,
      context: initialContext
    },
    initialMessages: persistentMessages.length > 0 ? persistentMessages : [
      {
        id: 'welcome',
        role: 'assistant',
        content: getInitialMessage()
      }
    ],
    onFinish: async (message) => {
      try {
        // Update persistent conversation state
        const updatedMessages = [...messages, message];
        
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
        
        updatePersistentConversation(currentConversationId, cleanedMessages);
        
        // Save conversation to database if this is the first message
        if (!currentConversationId && messages.length === 1) {
          try {
            const result = await createConversationWithMessage({
              firstMessage: input,
              title: input.substring(0, 50) + '...',
              type: 'general',
              context: initialContext,
              isFullscreen
            });
            
            if (result.success && result.conversation) {
              setCurrentConversationId(result.conversation.id);
              updatePersistentConversation(result.conversation.id, cleanedMessages);
            }
          } catch (dbError) {
            // Handle database error silently in production
          }
        }
      } catch (error) {
        // Handle errors silently in production
      }
    },
    onError: (error) => {
      // Handle errors silently in production
    }
  });

  // Initialize with persistent conversation if available
  useEffect(() => {
    if (persistentConversationId && !currentConversationId) {
      setCurrentConversationId(persistentConversationId);
    }
  }, [persistentConversationId, currentConversationId]);

  // Update persistent state when messages change
  useEffect(() => {
    if (messages.length > 0) {
      updatePersistentConversation(currentConversationId, messages);
    }
  }, [messages, currentConversationId, updatePersistentConversation]);

  // Load conversation history
  const loadConversations = async () => {
    setIsLoadingHistory(true);
    try {
      const result = await getUserConversations(1, 20);
      if (result.success) {
        setConversations(result.conversations);
      }
    } catch (error) {
      // Handle loading conversations error silently
    }
    setIsLoadingHistory(false);
  };

  // Load specific conversation
  const loadConversation = async (convId) => {
    try {
      const result = await getConversationWithMessages(convId);
      if (result.success) {
        const conv = result.conversation;
        const formattedMessages = conv.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }));
        
        setMessages(formattedMessages);
        setCurrentConversationId(convId);
        setShowHistory(false);
      }
    } catch (error) {
      // Handle loading conversation error silently
    }
  };

  // Start new conversation
  const startNewConversation = () => {
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant',
      content: getInitialMessage()
    };
    
    setMessages([welcomeMessage]);
    setCurrentConversationId(null);
    setShowHistory(false);
    
    // Clear persistent conversation state
    clearPersistentConversation();
  };

  // Toggle fullscreen mode
  const handleFullscreenToggle = async () => {
    try {
      // Update database if we have a conversation
      if (currentConversationId) {
        try {
          const result = await toggleConversationFullscreen(currentConversationId, !isFullscreen);
          
          if (!result.success) {
            // Handle error silently
          }
        } catch (dbError) {
          // Handle database error silently
        }
      }
      
      // Only navigate if we're not in fullscreen mode and not already on chatbot page
      if (!isFullscreen && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        
        if (currentPath !== '/chatbot') {
          // Navigate to fullscreen page if on a different page
          const conversationParam = currentConversationId ? `?conversation=${currentConversationId}` : '';
          const targetUrl = `/chatbot${conversationParam}`;
          
          try {
            window.location.href = targetUrl;
          } catch (navError) {
            // Handle navigation error silently
          }
        } else {
          // Already on chatbot page, just update URL if needed
          if (currentConversationId) {
            const newUrl = `/chatbot?conversation=${currentConversationId}`;
            
            try {
              window.history.replaceState({}, '', newUrl);
            } catch (urlError) {
              // Handle URL update error silently
            }
          }
        }
      }
    } catch (error) {
      // Handle fullscreen toggle error silently
    }
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
      // Handle delete conversation error silently
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations when history is opened
  useEffect(() => {
    if (showHistory) {
      loadConversations();
    }
  }, [showHistory]);

  // Suggested questions
  const suggestedQuestions = [
    "كيف أختار التخصص المناسب لي؟",
    "ما هي أفضل استراتيجيات التسجيل؟",
    "كيف أحسب فرص قبولي؟",
    "ما الفرق بين الجامعات الحكومية والخاصة؟",
    "كيف أقارن بين التخصصات المختلفة؟"
  ];

  // Don't show if not open (unless in sidebar mode)
  if (!isOpen && mode !== 'sidebar') return null;

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[9999] flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">نيكسي - المساعد الذكي</h1>
              <p className="text-sm text-gray-400">مساعدك في التوجيه الجامعي</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={`text-gray-400 hover:text-white ${showHistory ? 'bg-slate-700' : ''}`}
              title="المحادثات السابقة"
            >
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">المحادثات</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="text-gray-400 hover:text-white"
              title="محادثة جديدة"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="text-sm">جديد</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.close()}
              className="text-gray-400 hover:text-white"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - History */}
          {showHistory && (
            <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold text-white">المحادثات السابقة</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          conv.id === currentConversationId
                            ? 'bg-blue-600/20 border border-blue-500/30'
                            : 'bg-slate-700/50 hover:bg-slate-700'
                        }`}
                        onClick={() => loadConversation(conv.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                              {conv.title || 'محادثة جديدة'}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {conv.messages[0]?.content?.substring(0, 50)}...
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString('ar')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.id);
                            }}
                            className="text-gray-400 hover:text-red-400 ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : 'bg-slate-800 text-gray-100 border border-slate-700'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <MessageFormatter content={message.content} />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4">
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
            <div className="border-t border-slate-700 p-6">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="اكتب رسالتك هنا..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              {/* Suggested Questions */}
              {messages.length === 1 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-3">أسئلة مقترحة:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleInputChange({ target: { value: question } });
                        }}
                        className="text-xs border-slate-600 text-gray-300 hover:bg-slate-700"
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

  // Sidebar mode - full height, no bottom positioning
  if (mode === 'sidebar') {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">نيكسي</h3>
              <p className="text-xs text-cyan-100">مساعدك الذكي</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
            >
              <Clock className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreenToggle}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-gray-100'
                }`}
              >
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <MessageFormatter content={message.content} />
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-gray-100 rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-200"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-400"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-700 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              dir="rtl"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Widget mode (default)
  return (
    <div
      className={`fixed right-4 bottom-4 z-[60] transition-all duration-300 ${
        isMinimized 
          ? 'w-16 h-16' 
          : 'w-96 h-[600px]'
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            {!isMinimized && (
              <div>
                <h3 className="font-semibold text-white text-sm">نيكسي</h3>
                <p className="text-xs text-cyan-100">مساعدك الذكي</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {!isMinimized && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6 ${showHistory ? 'bg-white/10' : ''}`}
                  title="المحادثات السابقة"
                >
                  <Clock className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startNewConversation}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
                  title="محادثة جديدة"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreenToggle}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
                >
                  <Minimize2 className="w-3 h-3" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={isMinimized ? () => setIsMinimized(false) : (onClose || onToggle)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
            >
              {isMinimized ? <MessageCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : 'bg-slate-800 text-gray-100'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <MessageFormatter content={message.content} />
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-700 p-3">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="اكتب رسالة..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
