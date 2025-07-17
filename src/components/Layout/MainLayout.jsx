'use client'

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/app/i18n/client';

// Import components
import Sidebar from '../Sidebar';
import TopNavbar from '../TopNavbar';
import FloatingNexie from '../FloatingNexie';

export default function MainLayout({ children }) {
  // Mock user for UI purposes
  const user = null;
  const { dictionary, locale } = useI18n();
  const isRtl = locale === 'tn';
  const pathname = usePathname();
  
  // Layout state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle sidebar function to pass to TopNavbar
  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebarExpanded', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Check if we're on home page
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  // Load layout preferences
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarExpanded');
    if (savedSidebarState) {
      setIsSidebarExpanded(JSON.parse(savedSidebarState));
    }
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-sidebar') && !event.target.closest('button[aria-label="Toggle mobile menu"]')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Desktop Sidebar - Fixed position */}
      <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 ${isSidebarExpanded ? 'w-64' : 'w-16'} hidden md:block`}>
        <Sidebar isExpanded={isSidebarExpanded} onToggleExpand={toggleSidebar} />
      </div>

      {/* Desktop Main Content Area - Shifts with sidebar */}
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-16'} hidden md:flex`}>
        {/* Top Navigation - Follows sidebar width */}
        <TopNavbar 
          isSidebarExpanded={isSidebarExpanded}
          onToggleMobileMenu={toggleMobileMenu}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {/* Mobile Layout - Full width on mobile */}
      <div className="flex-1 flex flex-col min-h-0 md:hidden w-full">
        {/* Top Navigation - Mobile */}
        <TopNavbar 
          isSidebarExpanded={false}
          onToggleMobileMenu={toggleMobileMenu}
        />

        {/* Main Content - Mobile */}
        <main className="flex-1 overflow-auto p-3 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform ${isMobileMenuOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')} transition-transform duration-300 ease-in-out z-50 md:hidden overflow-y-auto`}>
        <Sidebar 
          isExpanded={true} 
          onToggleExpand={() => setIsMobileMenuOpen(false)}
          isMobile={true}
        />
      </div>

      {/* Floating Nexie 3D Assistant */}
      <FloatingNexie />
    </div>
  );
}
