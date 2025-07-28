'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { useI18n } from '../app/i18n/client';

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇹🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

export default function LanguageSwitcher({ isMobile = false }) {
  const { locale, changeLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale) => {
    changeLocale(newLocale);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Language / اللغة</h4>
        <div className="grid grid-cols-1 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentLang.code === lang.code
                  ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLang.code === lang.code && (
                <div className="w-2 h-2 bg-cyan-400 rounded-full ml-auto"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-slate-700"
        >
          <Globe className="w-4 h-4" />
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden md:inline">{currentLang.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center space-x-3 cursor-pointer ${
              currentLang.code === lang.code
                ? 'bg-cyan-600/20 text-cyan-400'
                : 'text-gray-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {currentLang.code === lang.code && (
              <div className="w-2 h-2 bg-cyan-400 rounded-full ml-auto"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
