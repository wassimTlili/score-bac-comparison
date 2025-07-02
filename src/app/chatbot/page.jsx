'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import Link from 'next/link';

export default function ChatbotPage() {
  const messagesEndRef = useRef(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      isGeneralChat: true
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Bonjour ! Je suis votre assistant éducatif IA. Je peux vous aider avec :

• Conseils d'orientation scolaire et universitaire
• Informations sur les filières et débouchés
• Stratégies de révision et méthodes d'étude
• Questions sur le système éducatif tunisien
• Préparation aux examens et concours

Comment puis-je vous aider aujourd'hui ?`
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
    // Reset messages to initial state
    window.location.reload();
  };

  const suggestedQuestions = [
    "Comment choisir ma filière après le BAC ?",
    "Quelles sont les meilleures méthodes de révision ?",
    "Comment calculer ma moyenne BAC ?",
    "Quels débouchés pour la filière scientifique ?",
    "Comment me préparer pour les concours d'entrée ?",
    "Quelles universités recommandez-vous en Tunisie ?"
  ];

  return (
    <div className="h-screen bg-[#0f172a] text-[#e5e7eb] flex flex-col">
      {/* Minimal Header */}
      <div className="border-b border-slate-800/50 bg-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#ab68ff] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h1 className="text-lg font-medium text-white">Assistant IA</h1>
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nouveau chat</span>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-[#10a37f] text-white' 
                      : 'bg-[#ab68ff] text-white'
                  }`}>
                    {message.role === 'user' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-white">
                        {message.role === 'user' ? 'Vous' : 'Assistant'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="group">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#ab68ff] text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-white">Assistant</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-400">En train d'écrire...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions - Only show when no real conversation */}
        {messages.length <= 1 && (
          <div className="px-4 pb-4">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleInputChange({ target: { value: question } });
                      // Auto-submit after a short delay
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) {
                          const event = new Event('submit', { bubbles: true, cancelable: true });
                          form.dispatchEvent(event);
                        }
                      }, 100);
                    }}
                    className="p-3 text-left text-sm text-gray-300 bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="border-t border-slate-800/50 px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Message Assistant IA..."
                className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent resize-none overflow-hidden min-h-[52px] max-h-32"
                disabled={isLoading}
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '52px'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#10a37f] hover:bg-[#0d8c6f] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
