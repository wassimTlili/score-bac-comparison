'use client';

import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Lightweight components for optimized rendering
const components = {
  // Simplified code blocks for better performance
  code({ node, inline, className, children, ...props }) {
    if (!inline) {
      return (
        <pre className="bg-slate-900 p-3 rounded-lg overflow-x-auto my-2">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    }
    
    return (
      <code 
        className="bg-slate-800 text-cyan-300 px-2 py-1 rounded text-sm font-mono" 
        {...props}
      >
        {children}
      </code>
    );
  },

  // Simplified headings
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mb-3 mt-4">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-white mb-2 mt-3">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="text-base font-medium text-white mb-2 mt-2">
      {children}
    </h3>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="text-gray-100 leading-relaxed mb-2">
      {children}
    </p>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-gray-100 mb-2 space-y-1">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-gray-100 mb-2 space-y-1">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="text-gray-100">
      {children}
    </li>
  ),

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-cyan-200 my-3">
      {children}
    </blockquote>
  ),

  // Tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border border-slate-600">
        {children}
      </table>
    </div>
  ),

  th: ({ children }) => (
    <th className="border border-slate-600 px-3 py-2 bg-slate-800 text-white font-semibold">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border border-slate-600 px-3 py-2 text-gray-100">
      {children}
    </td>
  ),

  // Links
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
  const processedContent = useMemo(() => {
    if (!content) return '';
    
    return content
      // Add emoji for success indicators
      .replace(/✅|✓|succeed|success/gi, '✅')
      // Add emoji for warnings
      .replace(/⚠️|warning|attention/gi, '⚠️')
      // Add emoji for errors
      .replace(/❌|error|failed/gi, '❌')
      // Add emoji for information
      .replace(/ℹ️|info|information/gi, 'ℹ️')
      // Add emoji for tips
      .replace(/💡|tip|conseil/gi, '💡');
  }, [content]);

  if (!processedContent) {
    return <div className="text-gray-500 italic">No content</div>;
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        className="text-sm leading-relaxed"
      >
        {processedContent}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1">
          |
        </span>
      )}
    </div>
  );
});

MessageFormatter.displayName = 'MessageFormatter';

export default MessageFormatter;
