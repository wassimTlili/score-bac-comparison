// Diagnostic function for fullscreen issues
export function diagnoseFulscreenIssue() {
  console.log('🔍 Diagnosing fullscreen issue...');
  
  // Check current URL
  console.log('Current URL:', window.location.href);
  console.log('Current pathname:', window.location.pathname);
  
  // Check if we're already on the chatbot page
  const isOnChatbotPage = window.location.pathname === '/chatbot';
  console.log('Is on chatbot page:', isOnChatbotPage);
  
  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const conversationParam = urlParams.get('conversation');
  console.log('Conversation parameter:', conversationParam);
  
  // Check local storage
  const chatOpenStates = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('chatOpen_')) {
      chatOpenStates[key] = localStorage.getItem(key);
    }
  }
  console.log('Chat open states:', chatOpenStates);
  
  // Check if FloatingNexie context is available
  if (typeof window !== 'undefined' && window.React) {
    console.log('React is available');
  }
  
  // Check console for any errors
  console.log('Check the console for any errors above this message');
  
  return {
    isOnChatbotPage,
    conversationParam,
    chatOpenStates,
    currentUrl: window.location.href
  };
}

// Add this function to window for easy access from browser console
if (typeof window !== 'undefined') {
  window.diagnoseFulscreenIssue = diagnoseFulscreenIssue;
}
