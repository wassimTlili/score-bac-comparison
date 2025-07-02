'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LAYOUT_MODES = {
  SPLIT: 'split',
  ANALYSIS_EXPANDED: 'analysis_expanded',
  CHAT_EXPANDED: 'chat_expanded'
};

export default function ExpandableLayout({ 
  analysisComponent, 
  chatComponent, 
  analysisTitle = "Analyse IA", 
  chatTitle = "Assistant IA" 
}) {
  const [layoutMode, setLayoutMode] = useState(LAYOUT_MODES.SPLIT);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only trigger if not typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      if (event.altKey) {
        switch (event.code) {
          case 'Digit1':
            event.preventDefault();
            handleLayoutChange(LAYOUT_MODES.SPLIT);
            break;
          case 'Digit2':
            event.preventDefault();
            handleLayoutChange(LAYOUT_MODES.ANALYSIS_EXPANDED);
            break;
          case 'Digit3':
            event.preventDefault();
            handleLayoutChange(LAYOUT_MODES.CHAT_EXPANDED);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutMode]);

  const handleLayoutChange = (mode) => {
    if (mode === layoutMode) return;
    
    setIsTransitioning(true);
    setLayoutMode(mode);
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const getLayoutClasses = () => {
    switch (layoutMode) {
      case LAYOUT_MODES.ANALYSIS_EXPANDED:
        return "grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4";
      case LAYOUT_MODES.CHAT_EXPANDED:
        return "grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4";
      default:
        return "grid grid-cols-1 lg:grid-cols-2 gap-6";
    }
  };

  const getPanelClasses = (panel) => {
    const baseClasses = "bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out";
    const fullScreenHeight = "h-[calc(100vh-8rem)]";
    const collapsedHeight = "h-[calc(100vh-8rem)] lg:h-[280px]";
    
    if (layoutMode === LAYOUT_MODES.SPLIT) {
      return `${baseClasses} ${fullScreenHeight}`;
    }
    
    if (panel === 'analysis') {
      return layoutMode === LAYOUT_MODES.ANALYSIS_EXPANDED
        ? `${baseClasses} ${fullScreenHeight}`
        : `${baseClasses} ${collapsedHeight}`;
    }
    
    if (panel === 'chat') {
      return layoutMode === LAYOUT_MODES.CHAT_EXPANDED
        ? `${baseClasses} ${fullScreenHeight}`
        : `${baseClasses} ${collapsedHeight}`;
    }
    
    return `${baseClasses} ${fullScreenHeight}`;
  };

  const ExpandButton = ({ mode, icon, tooltip, isActive }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleLayoutChange(mode)}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
          : 'hover:bg-slate-600/50 text-gray-400 hover:text-white border border-transparent hover:border-slate-500'
      }`}
      title={tooltip}
      disabled={isTransitioning}
    >
      {icon}
    </motion.button>
  );

  const CollapseButton = ({ onClick, tooltip }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-slate-600/50 text-gray-400 hover:text-white transition-all duration-200 border border-transparent hover:border-slate-500"
      title={tooltip}
      disabled={isTransitioning}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </motion.button>
  );

  return (
    <div className={getLayoutClasses()}>
      {/* Analysis Panel */}
      <motion.div 
        layout
        className={getPanelClasses('analysis')}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 border-b border-slate-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-semibold flex items-center">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {analysisTitle}
              {layoutMode === LAYOUT_MODES.CHAT_EXPANDED && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">Réduit</span>
              )}
            </h2>
            
            <div className="flex items-center space-x-1">
              {layoutMode !== LAYOUT_MODES.ANALYSIS_EXPANDED ? (
                <ExpandButton
                  mode={LAYOUT_MODES.ANALYSIS_EXPANDED}
                  tooltip="Agrandir l'analyse (Alt+2)"
                  isActive={false}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  }
                />
              ) : (
                <CollapseButton
                  onClick={() => handleLayoutChange(LAYOUT_MODES.SPLIT)}
                  tooltip="Vue partagée (Alt+1)"
                />
              )}
              
              {layoutMode === LAYOUT_MODES.SPLIT && (
                <ExpandButton
                  mode={LAYOUT_MODES.CHAT_EXPANDED}
                  tooltip="Agrandir le chat (Alt+3)"
                  isActive={false}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  }
                />
              )}
            </div>
          </div>
          
          {layoutMode !== LAYOUT_MODES.SPLIT && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center mt-3 space-x-2"
            >
              <ExpandButton
                mode={LAYOUT_MODES.SPLIT}
                tooltip="Vue partagée"
                isActive={layoutMode === LAYOUT_MODES.SPLIT}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4m6-14h4a2 2 0 012 2v12a2 2 0 01-2 2h-4m-6 0V4" />
                  </svg>
                }
              />
              <ExpandButton
                mode={LAYOUT_MODES.ANALYSIS_EXPANDED}
                tooltip="Vue analyse"
                isActive={layoutMode === LAYOUT_MODES.ANALYSIS_EXPANDED}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <ExpandButton
                mode={LAYOUT_MODES.CHAT_EXPANDED}
                tooltip="Vue chat"
                isActive={layoutMode === LAYOUT_MODES.CHAT_EXPANDED}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
              />
            </motion.div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`analysis-${layoutMode}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {analysisComponent}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Chat Panel */}
      <motion.div 
        layout
        className={getPanelClasses('chat')}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 border-b border-slate-600 bg-gradient-to-r from-green-600 to-blue-600 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold flex items-center">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {chatTitle}
                {layoutMode === LAYOUT_MODES.ANALYSIS_EXPANDED && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">Réduit</span>
                )}
              </h2>
              <p className="text-xs lg:text-sm opacity-90 mt-1">
                Posez vos questions sur cette comparaison
              </p>
            </div>
            
            <div className="flex items-center space-x-1">
              {layoutMode !== LAYOUT_MODES.CHAT_EXPANDED ? (
                <ExpandButton
                  mode={LAYOUT_MODES.CHAT_EXPANDED}
                  tooltip="Agrandir le chat"
                  isActive={false}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  }
                />
              ) : (
                <CollapseButton
                  onClick={() => handleLayoutChange(LAYOUT_MODES.SPLIT)}
                  tooltip="Vue partagée (Alt+1)"
                />
              )}
              
              {layoutMode === LAYOUT_MODES.SPLIT && (
                <ExpandButton
                  mode={LAYOUT_MODES.ANALYSIS_EXPANDED}
                  tooltip="Agrandir l'analyse (Alt+2)"
                  isActive={false}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
              )}
            </div>
          </div>
          
          {layoutMode !== LAYOUT_MODES.SPLIT && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center mt-3 space-x-2"
            >
              <ExpandButton
                mode={LAYOUT_MODES.SPLIT}
                tooltip="Vue partagée"
                isActive={layoutMode === LAYOUT_MODES.SPLIT}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4m6-14h4a2 2 0 012 2v12a2 2 0 01-2 2h-4m-6 0V4" />
                  </svg>
                }
              />
              <ExpandButton
                mode={LAYOUT_MODES.ANALYSIS_EXPANDED}
                tooltip="Vue analyse"
                isActive={layoutMode === LAYOUT_MODES.ANALYSIS_EXPANDED}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <ExpandButton
                mode={LAYOUT_MODES.CHAT_EXPANDED}
                tooltip="Vue chat"
                isActive={layoutMode === LAYOUT_MODES.CHAT_EXPANDED}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
              />
            </motion.div>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`chat-${layoutMode}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {chatComponent}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
