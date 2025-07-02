'use client'

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/app/i18n/client';
import { usePomodoro } from '@/app/contexts/PomodoroTimer';

// Import components
import Sidebar from '../Sidebar';
import TopNavbar from '../TopNavbar';
import { PomodoroTimer } from '../PomodoroTimer';
import { SettingsDialog } from '../SettingsDialog';
import LofiPlayer from '../LofiPlayer';
import { Button } from "@/components/ui/button";
import { Settings, Timer, Music, X } from 'lucide-react';

export default function MainLayout({ children }) {
  // Mock user for UI purposes
  const user = null;
  const { dictionary, locale } = useI18n();
  const isRtl = locale === 'tn';
  const pathname = usePathname();
  
  // Layout state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTimerPanel, setShowTimerPanel] = useState(false);
  const [showLofiPanel, setShowLofiPanel] = useState(false);

  // Toggle sidebar function to pass to TopNavbar
  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebarExpanded', JSON.stringify(newValue));
      return newValue;
    });
  };
  
  // Pomodoro state
  const {
    time,
    isActive,
    mode,
    settings,
    setSettings,
    toggleTimer,
    resetTimer,
    skipTimer,
    formatTime,
    tasks
  } = usePomodoro();
  
  // Settings dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check if we're on home page
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setNotificationsEnabled(permission === 'granted');
        });
      }
    }
  }, []);

  // Load layout preferences
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarExpanded');
    if (savedSidebarState) {
      setIsSidebarExpanded(JSON.parse(savedSidebarState));
    }

    const savedTimerPanel = localStorage.getItem('showTimerPanel');
    if (savedTimerPanel) {
      setShowTimerPanel(JSON.parse(savedTimerPanel));
    }

    const savedLofiPanel = localStorage.getItem('showLofiPanel');
    if (savedLofiPanel) {
      setShowLofiPanel(JSON.parse(savedLofiPanel));
    }
  }, []);

  // Save layout preferences
  const toggleTimerPanel = () => {
    const newState = !showTimerPanel;
    setShowTimerPanel(newState);
    localStorage.setItem('showTimerPanel', JSON.stringify(newState));
  };

  const toggleLofiPanel = () => {
    const newState = !showLofiPanel;
    setShowLofiPanel(newState);
    localStorage.setItem('showLofiPanel', JSON.stringify(newState));
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Fixed position */}
      <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${isSidebarExpanded ? 'w-64' : 'w-16'} hidden md:block`}>
        <Sidebar isExpanded={isSidebarExpanded} onToggleExpand={toggleSidebar} />
      </div>

      {/* Main Content Area - Shifts with sidebar */}
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-16'} hidden md:flex`}>
        {/* Top Navigation - Follows sidebar width */}
        <TopNavbar 
          isSidebarExpanded={isSidebarExpanded}
        />

        {/* Content Area with Side Panels */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>

          {/* Right Side Panels */}
          <div className="flex flex-col">
            {/* Pomodoro Timer Panel */}
            {showTimerPanel && (
              <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {dictionary.sidebar?.pomodoroTimer || 'Pomodoro Timer'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTimerPanel}
                  >
                    <X size={16} />
                  </Button>
                </div>
                <div className="p-4">
                  <PomodoroTimer
                    time={time}
                    isActive={isActive}
                    mode={mode}
                    toggleTimer={toggleTimer}
                    resetTimer={resetTimer}
                    skipTimer={skipTimer}
                    formatTime={formatTime}
                    settings={settings}
                    setSettings={setSettings}
                    isSettingsOpen={isSettingsOpen}
                    setIsSettingsOpen={setIsSettingsOpen}
                    tasks={tasks}
                    userId={user?.id}
                  />
                </div>
              </div>
            )}

            {/* Lofi Player Panel */}
            {showLofiPanel && (
              <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Lofi Player
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLofiPanel}
                  >
                    <X size={16} />
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  <LofiPlayer userId={user?.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Content - Full width on mobile */}
      <div className="flex-1 flex flex-col min-h-0 md:hidden">
        {/* Top Navigation - Mobile */}
        <TopNavbar 
          isSidebarExpanded={isSidebarExpanded}
        />

        {/* Content Area - Mobile */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-gray-900 transform ${isMobileMenuOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')} transition-transform duration-300 ease-in-out z-50 md:hidden`}>
        <Sidebar isExpanded={true} onToggleExpand={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Floating Action Buttons for Panels */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        {/* Settings Button */}
        <Button
          onClick={() => setIsSettingsOpen(true)}
          className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-white shadow-lg"
        >
          <Settings size={20} />
        </Button>

        {/* Timer Panel Toggle */}
        <Button
          onClick={toggleTimerPanel}
          className={`w-12 h-12 rounded-full shadow-lg ${
            showTimerPanel 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-700 border'
          }`}
        >
          <Timer size={20} />
        </Button>

        {/* Lofi Panel Toggle */}
        <Button
          onClick={toggleLofiPanel}
          className={`w-12 h-12 rounded-full shadow-lg ${
            showLofiPanel 
              ? 'bg-purple-500 hover:bg-purple-600 text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-700 border'
          }`}
        >
          <Music size={20} />
        </Button>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        settings={settings}
        setSettings={setSettings}
        isOpen={isSettingsOpen}
        setIsOpen={setIsSettingsOpen}
        tasks={tasks}
        userId={user?.id}
      />
    </div>
  );
}
