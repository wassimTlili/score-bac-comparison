'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { X, Send, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import MessageFormatter from './MessageFormatter';

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  userData = null,
  contextMessage = null 
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Create context-aware initial message
  const getInitialMessage = () => {
    if (contextMessage) {
      return contextMessage;
    }
    
    if (userData && userData.context === 'recommendations') {
      return `مرحباً! أنا نكسي، مساعدك الذكي للتوجيه الجامعي 🎓

أرى أنك تتصفح التوصيات المخصصة لك. إليك تحليل سريع:

📊 **معدلك العام**: ${userData.mg?.toFixed(2) || 'غير محسوب'}
🎯 **نقاطك**: ${userData.fs?.toFixed(2) || 'غير محسوب'}
📍 **ولايتك**: ${userData.wilaya || 'غير محدد'}
📚 **شعبتك**: ${userData.filiere || 'غير محدد'}

يمكنني مساعدتك في:
• **فهم التوصيات**: لماذا يناسبك تخصص معين؟
• **تحليل الفرص**: ما هي احتمالات قبولك؟
• **معلومات الجامعات**: تفاصيل الأقطاب والمؤسسات
• **نصائح التحسين**: كيف تزيد من فرصك؟
• **المقارنة بين التخصصات**: أيهما أفضل لك؟

ما الذي تريد أن تعرفه حول توجهك الجامعي؟`;
    }
    
    if (userData && userData.context === 'comparison') {
      return `مرحباً! أنا نكسي، مساعد المقارنة الذكي 🔍

أرى أنك تستخدم أداة المقارنة. إليك ملخص وضعك:

📊 **معدلك**: ${userData.mg?.toFixed(2) || 'غير محسوب'}
🎯 **نقاطك**: ${userData.fs?.toFixed(2) || 'غير محسوب'}
📍 **ولايتك**: ${userData.wilaya || 'غير محدد'}

يمكنني مساعدتك في:
• **اختيار التخصصات للمقارنة**: أي التخصصات تناسبك؟
• **تحليل النتائج**: فهم نتائج المقارنة
• **عوامل الاختيار**: ما هي المعايير المهمة؟
• **المشورة الشخصية**: نصائح مخصصة لحالتك

اختر التخصصات وابدأ المقارنة، وسأساعدك في تحليل النتائج!`;
    }
    
    if (userData) {
      return `مرحباً! أنا نكسي، مساعدك الذكي 🤖

لقد راجعت بياناتك:
📊 **معدلك**: ${userData.mg?.toFixed(2) || 'غير محسوب'} 
🎯 **النقاط**: ${userData.fs?.toFixed(2) || 'غير محسوب'}
📍 **الولاية**: ${userData.wilaya || 'غير محدد'}
📚 **الشعبة**: ${userData.filiere || 'غير محدد'}

يمكنني مساعدتك في:
• تحليل نتائجك وفرصك
• معلومات عن الجامعات والمعاهد
• نصائح للتوجيه الجامعي
• إرشادات حول المنح والإقامة
• أي استفسارات أخرى تتعلق بالتعليم العالي

ما الذي تريد معرفته؟`;
    }
    
    return `مرحباً! أنا نكسي، مساعدك الذكي 🤖

يمكنني مساعدتك في:
• التوجيه الجامعي والمهني
• معلومات عن الجامعات والمعاهد
• حساب المعدلات والنقاط
• نصائح للدراسة والمراجعة
• معلومات عن المنح والإقامة

كيف يمكنني مساعدتك اليوم؟`;
  };

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      isGeneralChat: true,
      userData: userData
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: getInitialMessage()
      }
    ],
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearChat = () => {
    window.location.reload();
  };

  const suggestedQuestions = [
    "ما هي أفضل الجامعات في تونس؟",
    "كيف أحسب معدل الباكالوريا؟",
    "ما هي المنح المتاحة للطلاب؟",
    "كيف أختار التخصص المناسب؟",
    "ما هي شروط القبول في الجامعات؟",
    "كيف أحضر لامتحان الباكالوريا؟"
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - only show on mobile screens when chat is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40 transition-opacity duration-300" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 right-0 z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        {/* Sidebar */}
        <div className={`relative bg-slate-900/95 backdrop-blur-sm border-l border-slate-700/50 shadow-2xl flex flex-col ${isMinimized ? 'w-16' : 'w-96 lg:w-[28rem]'} h-full transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
          {!isMinimized && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  نكسي - المساعد الذكي
                </h2>
                <p className="text-sm text-slate-400">مساعدك في التوجيه الجامعي</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 shadow-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                      : 'bg-slate-800/80 backdrop-blur-sm text-slate-100 border border-slate-700/50'
                  }`}>
                    {message.role === 'assistant' ? (
                      <MessageFormatter content={message.content} />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 backdrop-blur-sm text-slate-100 rounded-lg p-3 shadow-lg border border-slate-700/50">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-sm text-slate-400">نكسي يكتب...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                <h3 className="text-sm font-medium text-slate-300 mb-2">أسئلة مقترحة:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleInputChange({ target: { value: question } })}
                      className="text-right p-2 text-sm text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200 border border-slate-700/50 hover:border-cyan-500/50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 px-4 py-2 bg-slate-800/50 backdrop-blur-sm text-white rounded-lg border border-slate-600/50 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                  disabled={isLoading}
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}
