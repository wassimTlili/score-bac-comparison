'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { debugLog } from '@/utils/debug';

const FloatingNexieContext = createContext();

export function FloatingNexieProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [persistentConversationId, setPersistentConversationId] = useState(null);
  const [persistentMessages, setPersistentMessages] = useState([]);
  const pathname = usePathname();

  // Load persistent conversation state from localStorage with error handling
  useEffect(() => {
    try {
      const savedConversationId = localStorage.getItem('floatingNexie_conversationId');
      const savedMessages = localStorage.getItem('floatingNexie_messages');
      
      if (savedConversationId) {
        setPersistentConversationId(savedConversationId);
      }
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setPersistentMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading persistent conversation state:', error);
      // Clear corrupted data
      localStorage.removeItem('floatingNexie_conversationId');
      localStorage.removeItem('floatingNexie_messages');
    }
  }, []);

  // Save persistent conversation state to localStorage
  useEffect(() => {
    try {
      if (persistentConversationId) {
        localStorage.setItem('floatingNexie_conversationId', persistentConversationId);
      } else {
        localStorage.removeItem('floatingNexie_conversationId');
      }
    } catch (error) {
      console.error('Error saving conversation ID:', error);
    }
  }, [persistentConversationId]);

  // Save persistent messages to localStorage with better error handling
  useEffect(() => {
    try {
      if (persistentMessages.length > 0) {
        // Deep clean messages to prevent serialization issues
        const cleanedMessages = persistentMessages.map(msg => ({
          id: msg.id || Date.now().toString(),
          role: msg.role || 'assistant',
          content: typeof msg.content === 'string' ? msg.content : 
                   typeof msg.content === 'object' && msg.content !== null ? JSON.stringify(msg.content) : 
                   String(msg.content || ''),
          createdAt: msg.createdAt || new Date().toISOString()
        }));
        
        localStorage.setItem('floatingNexie_messages', JSON.stringify(cleanedMessages));
      } else {
        localStorage.removeItem('floatingNexie_messages');
      }
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
      // If we can't save, at least clear the corrupted data
      localStorage.removeItem('floatingNexie_messages');
    }
  }, [persistentMessages]);

  // Pages where FloatingNexie should NOT appear
  const excludedPaths = ['/'];
  
  // Check if current path should show FloatingNexie
  const shouldShowOnCurrentPath = !excludedPaths.includes(pathname) && 
                                   !excludedPaths.some(path => path !== '/' && pathname.startsWith(path));

  // Reset state when navigating to excluded paths
  useEffect(() => {
    if (!shouldShowOnCurrentPath) {
      setIsActive(false);
      setActiveRoute(null);
    }
  }, [pathname, shouldShowOnCurrentPath]);

  const requestActivation = useCallback((route) => {
    debugLog('FloatingNexieContext', 'requestActivation called', { route, shouldShowOnCurrentPath, isActive, activeRoute });
    
    if (!shouldShowOnCurrentPath) {
      debugLog('FloatingNexieContext', 'Not showing on current path');
      return false;
    }
    
    if (!isActive) {
      debugLog('FloatingNexieContext', 'Activating on route:', route);
      setIsActive(true);
      setActiveRoute(route);
      return true;
    }
    
    // If already active on the same route, allow it
    const canActivate = activeRoute === route;
    debugLog('FloatingNexieContext', 'Already active, canActivate:', canActivate);
    return canActivate;
  }, [shouldShowOnCurrentPath, isActive, activeRoute]);

  const releaseActivation = useCallback((route) => {
    debugLog('FloatingNexieContext', 'releaseActivation called', { route, activeRoute });
    if (activeRoute === route) {
      debugLog('FloatingNexieContext', 'Deactivating route:', route);
      setIsActive(false);
      setActiveRoute(null);
    }
  }, [activeRoute]);

  // Functions to manage persistent conversation state
  const updatePersistentConversation = useCallback((conversationId, messages) => {
    try {
      setPersistentConversationId(conversationId);
      
      // Deep clean messages to prevent serialization issues
      const cleanedMessages = messages.map(msg => {
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
      
      setPersistentMessages(cleanedMessages);
    } catch (error) {
      console.error('Error updating persistent conversation:', error);
    }
  }, []);

  const clearPersistentConversation = useCallback(() => {
    try {
      setPersistentConversationId(null);
      setPersistentMessages([]);
      localStorage.removeItem('floatingNexie_conversationId');
      localStorage.removeItem('floatingNexie_messages');
    } catch (error) {
      console.error('Error clearing persistent conversation:', error);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isActive,
    activeRoute,
    shouldShowOnCurrentPath,
    requestActivation,
    releaseActivation,
    persistentConversationId,
    persistentMessages,
    updatePersistentConversation,
    clearPersistentConversation
  }), [
    isActive,
    activeRoute,
    shouldShowOnCurrentPath,
    requestActivation,
    releaseActivation,
    persistentConversationId,
    persistentMessages,
    updatePersistentConversation,
    clearPersistentConversation
  ]);

  return (
    <FloatingNexieContext.Provider value={contextValue}>
      {children}
    </FloatingNexieContext.Provider>
  );
}

export function useFloatingNexie() {
  const context = useContext(FloatingNexieContext);
  if (!context) {
    throw new Error('useFloatingNexie must be used within a FloatingNexieProvider');
  }
  return context;
}