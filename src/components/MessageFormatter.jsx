'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

// Custom components for enhanced rendering
const components = {
  // Enhanced code blocks with copy functionality
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    if (!inline && match) {
      return (
        <div className="relative group my-3">
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-lg border-b border-slate-600">
            <span className="text-xs font-medium text-gray-400 uppercase">{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-white"
            >
              📋 Copier
            </button>
          </div>
          <pre className="bg-slate-900 p-4 rounded-b-lg overflow-x-auto">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    }
    
    // Inline code
    return (
      <code
        className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Enhanced headers with icons
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
      <span className="text-cyan-400">🎯</span>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
      <span className="text-blue-400">📊</span>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-md font-medium text-white mb-2 flex items-center gap-2">
      <span className="text-green-400">✨</span>
      {children}
    </h3>
  ),

  // Styled paragraphs
  p: ({ children }) => (
    <p className="text-gray-200 mb-3 leading-relaxed">
      {children}
    </p>
  ),

  // Enhanced lists
  ul: ({ children }) => (
    <ul className="space-y-1 mb-3 ml-4">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-1 mb-3 ml-4 list-decimal">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-200 flex items-start gap-2">
      <span className="text-cyan-400 mt-1.5">•</span>
      <span>{children}</span>
    </li>
  ),

  // Enhanced blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-cyan-500 bg-slate-800/50 pl-4 py-2 my-3 italic">
      {children}
    </blockquote>
  ),

  // Enhanced tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-slate-600 text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-slate-600 bg-slate-700 px-3 py-2 text-left font-semibold text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-600 px-3 py-2 text-gray-200">
      {children}
    </td>
  ),

  // Enhanced links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-400 hover:text-cyan-300 underline decoration-dotted transition-colors"
    >
      {children} 🔗
    </a>
  ),

  // Strong/bold text
  strong: ({ children }) => (
    <strong className="font-semibold text-white">
      {children}
    </strong>
  ),

  // Emphasis/italic text
  em: ({ children }) => (
    <em className="italic text-cyan-200">
      {children}
    </em>
  ),

  // Horizontal rule
  hr: () => (
    <hr className="my-4 border-slate-600" />
  )
};

// Enhanced message formatter with performance optimizations
const MessageFormatter = memo(({ content, isStreaming = false }) => {
  // Process content for special formatting
  const processedContent = content
    // Add emoji for success indicators
    .replace(/✅|✓|succeed|success/gi, '✅')
    // Add emoji for warnings
    .replace(/⚠️|warning|attention/gi, '⚠️')
    // Add emoji for errors
    .replace(/❌|✗|error|failed/gi, '❌')
    // Add emoji for information
    .replace(/ℹ️|info|note/gi, 'ℹ️')
    // Add emoji for tips
    .replace(/💡|tip|conseil/gi, '💡')
    // Enhanced number formatting for scores
    .replace(/(\d+)\/200/g, '**$1**/200')
    // Enhanced percentage formatting
    .replace(/(\d+(?:\.\d+)?%)/g, '**$1**');

  return (
    <div className={`prose prose-invert max-w-none text-gray-200 ${isStreaming ? 'animate-pulse' : ''}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {processedContent}
      </ReactMarkdown>
      
      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-center gap-2 mt-2 text-cyan-400">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-xs">IA en train d'écrire...</span>
        </div>
      )}
    </div>
  );
});

MessageFormatter.displayName = 'MessageFormatter';

export default MessageFormatter;
