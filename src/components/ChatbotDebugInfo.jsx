// Debug component for chatbot page
import { useEffect, useState } from 'react';

export default function ChatbotDebugInfo({ 
  currentConversationId, 
  messages, 
  input, 
  conversationParam 
}) {
  const [debugInfo, setDebugInfo] = useState({});
  
  useEffect(() => {
    setDebugInfo({
      currentConversationId,
      messagesLength: messages.length,
      inputValue: input,
      conversationParam,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString()
    });
  }, [currentConversationId, messages, input, conversationParam]);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Debug Info:</div>
      <div className="space-y-1">
        <div>Conversation ID: {debugInfo.currentConversationId || 'None'}</div>
        <div>Messages Count: {debugInfo.messagesLength}</div>
        <div>Input Value: {debugInfo.inputValue || 'Empty'}</div>
        <div>URL Param: {debugInfo.conversationParam || 'None'}</div>
        <div>Current URL: {debugInfo.currentUrl}</div>
        <div>Last Update: {debugInfo.timestamp}</div>
      </div>
    </div>
  );
}
