'use client'

import React, { useState } from 'react';
import { ChevronDown, Menu, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';

export default function TopNavbar({ isSidebarExpanded, onToggleMobileMenu }) {
  // Set default to Tunisian Arabic
  const [selectedLanguage, setSelectedLanguage] = useState("العربية");
  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <nav className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-700">
      {/* Left Section - Mobile Menu Button + Logo */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors lg:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu size={24} />
        </button>
        <Link href="/" className={`flex items-center space-x-3 transition-opacity duration-300 ${isSidebarExpanded ? 'hidden lg:flex' : 'flex'}`}>
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="text-teal-400 font-bold text-lg hidden sm:block">NextGen.tn</span>
        </Link>
      </div>

      {/* Right Section - Language and Sign In */}
      <div className="flex items-center space-x-4">
        {/* Language Selector */}
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-auto border-0 bg-slate-800 hover:bg-slate-700 text-white focus:ring-0 px-3 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🇹🇳</span>
              <SelectValue placeholder="تونسي" />
              <ChevronDown size={14} />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="English" disabled className="text-gray-400 cursor-not-allowed">
              <div className="flex items-center space-x-2">
                <span>🇬🇧</span>
                <span>English</span>
              </div>
            </SelectItem>
            <SelectItem value="Français" disabled className="text-gray-400 cursor-not-allowed">
              <div className="flex items-center space-x-2">
                <span>🇫🇷</span>
                <span>Français</span>
              </div>
            </SelectItem>
            <SelectItem value="العربية" className="text-white hover:bg-slate-700 focus:bg-slate-700">
              <div className="flex items-center space-x-2">
                <span>🇹🇳</span>
                <span>تونسي</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Authentication Section */}
        {!isLoaded ? (
          <div className="w-24 h-10 bg-slate-800 rounded-lg animate-pulse"></div>
        ) : isSignedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-slate-800">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                  {user?.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || 'User'} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>
                <span className="hidden sm:block text-white">
                  {user?.firstName || user?.fullName || 'User'}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-600" align="end">
              <div className="px-3 py-2 border-b border-slate-600">
                <p className="text-sm font-medium text-white">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <DropdownMenuItem asChild>
                <Link 
                  href="/stepper/review" 
                  className="flex items-center space-x-2 text-white hover:bg-slate-700 cursor-pointer"
                >
                  <User size={14} />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-slate-600" />
              <DropdownMenuItem className="text-white hover:bg-slate-700" asChild>
                <button
                  className="flex items-center w-full text-right"
                  onClick={() => {
                    if (window.Clerk) {
                      window.Clerk.signOut();
                    } else {
                      window.location.href = '/sign-out';
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  تسجيل الخروج
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SignInButton mode="modal">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              Sign in
            </Button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}