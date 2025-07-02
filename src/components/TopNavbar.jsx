'use client'

import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNavbar({ isSidebarExpanded }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("Learn");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const pathname = usePathname();

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Navigation items for sub-navbar
  const navItems = [
    { name: 'Calculateur', href: '/', icon: '🧮' },
    { name: 'Comparaison', href: '/comparison', icon: '📊' },
    { name: 'Assistant IA', href: '/chatbot', icon: '🤖' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="sticky top-0 z-40">
      {/* Main Navbar */}
      <nav className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-700">
        {/* Left Section - Logo and Title */}
        <div className="flex items-center space-x-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">N</span>
              </div>
              <span className="text-teal-400 font-bold text-lg">NextGen.tn</span>
            </Link>
            <span className="text-white font-medium text-lg hidden lg:block">Study with NextGen</span>
          </div>
        </div>

        {/* Center Section - Music Player */}
        <div className="flex items-center space-x-4 bg-slate-800 px-5 py-3 rounded-full border border-slate-600">
          {/* Timer Display */}
          <div className="flex items-center space-x-2 text-red-400">
            <Clock size={16} />
            <span className="font-mono text-sm">25:00</span>
          </div>

          {/* Album Art */}
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <Image
              src="https://utfs.io/f/01bfbcb1-7ec2-4fee-9499-6e5863181ffe-s2s61b.jpg"
              alt="Album Cover"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Track Info */}
          <div className="text-left">
            <p className="text-white text-sm font-semibold">{currentTrack}</p>
            <p className="text-slate-400 text-xs">Lofi Beats</p>
          </div>

          {/* Music Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700 p-2 rounded-full"
            >
              <SkipBack size={16} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="text-white hover:bg-slate-700 p-2 rounded-full bg-slate-700"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700 p-2 rounded-full"
            >
              <SkipForward size={16} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-full ml-2"
            >
              <ChevronDown size={16} />
            </Button>
          </div>
        </div>

        {/* Right Section - Language and Sign In */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-auto border-0 bg-slate-800 hover:bg-slate-700 text-white focus:ring-0 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🇬🇧</span>
                <SelectValue />
                <ChevronDown size={14} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="English" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                <div className="flex items-center space-x-2">
                  <span>🇬🇧</span>
                  <span>English</span>
                </div>
              </SelectItem>
              <SelectItem value="Français" className="text-white hover:bg-slate-700 focus:bg-slate-700">
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

          {/* Sign In Button */}
          <Button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
            Sign in
          </Button>
        </div>
      </nav>

      {/* Sub Navigation Bar */}
      <div className="bg-slate-800 border-b border-slate-600 px-6 py-3">
        <div className="flex items-center justify-start space-x-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`
                  px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.href) 
                    ? 'bg-teal-500 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }
                `}
              >
                <span className="mr-2.5">{item.icon}</span>
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


