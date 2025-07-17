'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import MessageFormatter from './MessageFormatter';

export default function ChatBot({ comparison, onExpand, isExpanded }) {
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const messagesEndRef = useRef(null);

  // Extract user profile information
  const userProfile = comparison.userProfile || {};
  const comparisonData = comparison.aiAnalysis || {};
  
  // If no AI analysis yet, show loading state
  if (!comparison.aiAnalysis) {
    return (
      <div className="h-full flex flex-col rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.488-1.22L3 21l1.22-5.512A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">المحادثة الذكية</h3>
              <p className="text-xs text-gray-400">جاري التحضير...</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onExpand(isExpanded ? null : 'chat')}
              className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M20 12H4" : "M4 8h16M4 16h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h4 className="text-white font-medium mb-2">جاري إعداد المحادثة الذكية...</h4>
            <p className="text-sm text-gray-400 mb-4">
              ستتم تفعيل المحادثة بعد الانتهاء من التحليل
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 max-w-md">
              <p className="text-xs text-gray-400 text-right">
                💡 ستتمكن قريباً من:
                <br />• طرح أسئلة حول التخصصات
                <br />• الحصول على نصائح مخصصة
                <br />• معلومات عن فرص القبول
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      comparisonId: comparison.id
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    initialMessages: isFirstMessage ? [{
      id: 'welcome',
      role: 'assistant',
      content: `مرحباً! لقد حللت مقارنتك بين **${comparison.orientation1.name || comparison.orientation1.licence}** و **${comparison.orientation2.name || comparison.orientation2.licence}**.

📊 **ملفك الشخصي**: ${userProfile.score}/200 في ${userProfile.location}

🎯 **التوصية**: ${comparisonData.recommendation?.preferred || 'جاري التحليل...'}

يمكنني مساعدتك في فهم هذا التحليل والإجابة على أسئلتك حول:
• فرص القبول في الجامعات
• آفاق المهنة والرواتب
• خطوات التقديم والمواعيد
• البدائل المتاحة
• المنح والمساعدات المالية

ما الذي تود معرفته؟`
    }] : [],
    onFinish: () => {
      if (isFirstMessage) setIsFirstMessage(false);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update suggested questions to match reference project
  const quickQuestions = [
    "ما هي فرص قبولي؟",
    "ما هي أفضل الآفاق المهنية؟",
    "كيف أستعد لهذه الدراسات؟", 
    "أي جامعات توصي بها؟",
    "ما هي البدائل المتاحة؟"
  ];

  if (!comparison.aiAnalysis) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#1581f3] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium">Initialisation du chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Expand Button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-600 bg-slate-700/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#1581f3]/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-[#1581f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">المساعد الذكي</h3>
            <p className="text-xs text-gray-400">محادثة تفاعلية</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Switch Button - only show when expanded */}
          {isExpanded && (
            <button
              onClick={() => onExpand && onExpand('analysis')}
              className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors group"
              title="Basculer vers l'analyse IA"
            >
              <svg 
                className="w-4 h-4 text-gray-400 group-hover:text-[#1581f3] transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          )}
          
          {/* Expand Button */}
          <button
            onClick={() => onExpand && onExpand(isExpanded ? null : 'chat')}
            className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors group"
            title={isExpanded ? 'Réduire' : 'Agrandir'}
          >
            <svg 
              className={`w-4 h-4 text-gray-400 group-hover:text-[#1581f3] transition-all duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg shadow-sm ${
              message.role === 'user' 
                ? 'bg-[#1581f3] text-white rounded-br-sm' 
                : 'bg-slate-700/50 text-gray-100 border border-slate-600 rounded-bl-sm'
            }`}>
              {message.role === 'assistant' && index === 0 && (
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-600">
                  <div className="w-6 h-6 bg-[#1581f3]/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#1581f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-400">Assistant IA • Spécialisé Orientation</span>
                </div>
              )}
              
              {/* Enhanced message content */}
              {message.role === 'user' ? (
                <div className="text-sm leading-relaxed">
                  {message.content}
                </div>
              ) : (
                <MessageFormatter 
                  content={message.content} 
                  isStreaming={isLoading && index === messages.length - 1}
                />
              )}
              
              {/* Message metadata */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-600/50">
                <div className="text-xs text-gray-400">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(message.content)}
                      className="text-xs text-gray-400 hover:text-white transition-colors p-1 rounded"
                      title="Copier le message"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => {
                        // Add regenerate functionality if needed
                        console.log('Regenerate message:', message.id);
                      }}
                      className="text-xs text-gray-400 hover:text-white transition-colors p-1 rounded"
                      title="Régénérer la réponse"
                    >
                      🔄
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 rounded-lg px-4 py-3 border border-slate-600 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#1581f3] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#1581f3] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#1581f3] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-300">L'assistant analyse votre question...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-2 text-red-300 text-sm">
              Une erreur est survenue. Veuillez réessayer.
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 py-3 border-t border-slate-600 bg-slate-700/30">
          <p className="text-xs font-medium text-gray-300 mb-2">Questions suggérées :</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  handleInputChange({ target: { value: question } });
                  // Auto-submit the question
                  setTimeout(() => {
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    document.querySelector('form').dispatchEvent(event);
                  }, 100);
                }}
                className="text-xs bg-slate-700/50 hover:bg-[#1581f3]/20 text-gray-300 hover:text-[#1581f3] px-3 py-2 rounded-full border border-slate-600 hover:border-[#1581f3] transition-colors duration-200 cursor-pointer"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-600 bg-slate-700/30">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Tapez votre question ici..."
              className="w-full px-4 py-3 border border-slate-600 bg-slate-700/50 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1581f3] focus:border-transparent pr-12 placeholder-gray-400"
              disabled={isLoading}
              maxLength={500}
            />
            <div className="absolute right-3 top-3 text-xs text-gray-400">
              {input.length}/500
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#1581f3] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1581f3] flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Envoyer</span>
              </>
            )}
          </button>
        </div>
        
        {/* Character limit warning */}
        {input.length > 450 && (
          <p className="text-xs text-orange-400 mt-2">
            Attention: Limite de caractères bientôt atteinte ({input.length}/500)
          </p>
        )}
      </form>
    </div>
  );
}
