'use client';

import { memo, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageFormatter = memo(({ content, isAssistant = false }) => {
  const formattedContent = useMemo(() => {
    if (!content) return null;

    // Split content by code blocks first
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/);
    
    return parts.map((part, index) => {
      // Handle multi-line code blocks (```code```)
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3);
        const lines = codeContent.split('\n');
        const language = lines[0].trim() || 'text';
        const code = lines.slice(1).join('\n').trim();
        
        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-600">
            <div className="flex items-center justify-between bg-slate-800 px-3 py-2 border-b border-slate-600">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {language === 'text' ? 'Code' : language}
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)}
                className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-700"
              >
                Copier
              </button>
            </div>
            <SyntaxHighlighter
              language={language === 'text' ? 'plaintext' : language}
              style={oneDark}
              customStyle={{
                margin: 0,
                fontSize: '13px',
                lineHeight: '1.4',
                background: '#1e293b',
              }}
              showLineNumbers={code.split('\n').length > 3}
              wrapLines={true}
              wrapLongLines={true}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      // Handle inline code (`code`)
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code 
            key={index} 
            className="bg-slate-800 text-cyan-300 px-2 py-1 rounded text-sm font-mono border border-slate-600"
          >
            {code}
          </code>
        );
      }
      
      // Handle regular text with markdown-like formatting
      return (
        <span key={index} dangerouslySetInnerHTML={{ 
          __html: formatTextContent(part) 
        }} />
      );
    });
  }, [content]);

  return (
    <div className="message-content">
      {formattedContent}
    </div>
  );
});

// Helper function to format text content with markdown-like syntax
function formatTextContent(text) {
  return text
    // Bold text (**text**)
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Italic text (*text*)
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-200">$1</em>')
    // Links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
    // Lists (• or -)
    .replace(/^[•\-]\s(.+)$/gm, '<div class="flex items-start space-x-2 my-1"><span class="text-cyan-400 mt-1">•</span><span>$1</span></div>')
    // Numbers (1. 2. etc.)
    .replace(/^(\d+)\.\s(.+)$/gm, '<div class="flex items-start space-x-2 my-1"><span class="text-cyan-400 font-medium min-w-[20px]">$1.</span><span>$2</span></div>')
    // Headers (### text)
    .replace(/^###\s(.+)$/gm, '<h4 class="text-lg font-semibold text-white mt-4 mb-2 border-b border-slate-600 pb-1">$1</h4>')
    .replace(/^##\s(.+)$/gm, '<h3 class="text-xl font-semibold text-white mt-4 mb-2 border-b border-slate-600 pb-1">$1</h3>')
    .replace(/^#\s(.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-4 mb-3 border-b border-slate-600 pb-2">$1</h2>')
    // Emojis for better visual appeal
    .replace(/:\)/g, '😊')
    .replace(/:\(/g, '😔')
    .replace(/:D/g, '😃')
    .replace(/📊/g, '<span class="text-blue-400">📊</span>')
    .replace(/🎯/g, '<span class="text-green-400">🎯</span>')
    .replace(/⚠️/g, '<span class="text-yellow-400">⚠️</span>')
    .replace(/✅/g, '<span class="text-green-400">✅</span>')
    .replace(/❌/g, '<span class="text-red-400">❌</span>')
    // Line breaks
    .replace(/\n/g, '<br>');
}

// Enhanced message bubble component
export const MessageBubble = memo(({ message, isUser = false }) => {
  const timestamp = new Date().toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-gradient-to-r from-[#1581f3] to-blue-500 text-white px-4 py-3 rounded-lg rounded-br-sm shadow-lg">
            <div className="text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {timestamp}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-slate-700/70 backdrop-blur-sm text-gray-100 border border-slate-600/50 px-4 py-3 rounded-lg rounded-bl-sm shadow-lg">
          {/* AI Assistant Header */}
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-600/50">
            <div className="w-6 h-6 bg-gradient-to-r from-[#1581f3] to-cyan-400 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-300">Assistant IA</span>
            <div className="flex-1"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* Message Content */}
          <div className="text-sm leading-relaxed">
            <MessageFormatter content={message.content} isAssistant={true} />
          </div>
          
          {/* Timestamp */}
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-slate-600/30">
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
});

// Typing indicator component
export const TypingIndicator = memo(() => (
  <div className="flex justify-start mb-4">
    <div className="bg-slate-700/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-slate-600/50 shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gradient-to-r from-[#1581f3] to-cyan-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-[#1581f3] to-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-gradient-to-r from-[#1581f3] to-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        <span className="text-sm text-gray-300">L'assistant réfléchit...</span>
      </div>
    </div>
  </div>
));

// Quick question button component
export const QuickQuestionButton = memo(({ question, onClick, disabled }) => (
  <button
    type="button"
    onClick={() => onClick(question)}
    disabled={disabled}
    className="group text-xs bg-slate-700/50 hover:bg-gradient-to-r hover:from-[#1581f3]/20 hover:to-cyan-400/20 text-gray-300 hover:text-white px-3 py-2 rounded-full border border-slate-600 hover:border-[#1581f3] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
  >
    <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#1581f3] group-hover:to-cyan-400">
      {question}
    </span>
  </button>
));

MessageFormatter.displayName = 'MessageFormatter';
MessageBubble.displayName = 'MessageBubble';
TypingIndicator.displayName = 'TypingIndicator';
QuickQuestionButton.displayName = 'QuickQuestionButton';

export default MessageFormatter;
