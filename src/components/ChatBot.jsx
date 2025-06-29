'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';

export default function ChatBot({ comparison }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      comparisonId: comparison.id
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Bonjour ! Je suis votre assistant IA pour cette comparaison entre **${comparison.orientation1.name}** et **${comparison.orientation2.name}**.

Je peux vous aider avec:
• Des détails sur les conditions d'admission
• Les débouchés professionnels
• Les universités recommandées  
• La préparation aux études
• Toute autre question sur votre orientation

Que souhaitez-vous savoir ?`
      }
    ]
  });

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isInitialized || !comparison.aiAnalysis) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-medium">Initialisation du chat...</p>
        </div>
      </div>
    );
  }

  const suggestedQuestions = [
    "Quelles sont mes chances d'admission avec mon score ?",
    "Quels sont les débouchés les plus prometteurs ?",
    "Comment me préparer pour réussir mes études ?",
    "Quelles universités recommandez-vous dans ma région ?",
    "Quelles sont les alternatives si je ne suis pas admis ?"
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-gradient-to-r from-slate-700 to-slate-600 text-gray-100 border border-slate-500'
              }`}
            >
              <div className="prose prose-sm max-w-none text-inherit">
                {message.content.split('\n').map((line, index) => {
                  if (line.trim() === '') return <br key={index} />;
                  
                  // Handle markdown-style formatting
                  const formattedLine = line
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-cyan-200">$1</em>')
                    .replace(/•/g, '<span class="text-cyan-400">•</span>');
                  
                  return (
                    <p key={index} 
                       className="mb-2 last:mb-0 leading-relaxed"
                       dangerouslySetInnerHTML={{ __html: formattedLine }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-500 rounded-xl px-4 py-3 shadow-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-900/50 border border-red-500 rounded-lg px-4 py-2 text-red-300 text-sm">
              Une erreur est survenue. Veuillez réessayer.
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (only show initially) */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-slate-600 bg-slate-800/50">
          <h4 className="text-sm font-semibold text-cyan-300 mb-3 uppercase tracking-wide">💡 Questions suggérées:</h4>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  handleInputChange({ target: { value: question } });
                  setTimeout(() => {
                    const form = document.querySelector('#chat-form');
                    if (form) {
                      form.requestSubmit();
                    }
                  }, 100);
                }}
                className="block w-full text-left text-sm text-gray-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-cyan-500 rounded-lg p-3 transition-all duration-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="border-t border-slate-600 p-4 bg-slate-800/50">
        <form id="chat-form" onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
