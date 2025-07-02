'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'
import { ChevronDown, ChevronUp, Menu, X, LogOut, User, Download } from 'lucide-react'
import DarkModeToggle from './darkModeToggle'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '@/app/i18n/client'
 
export default function Sidebar({ isExpanded: externalIsExpanded, onToggleExpand }) {
  const [isExpanded, setIsExpanded] = useState(true) // Internal state for fallback
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})
  const [activeItem, setActiveItem] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  
  // Mock user state for UI purposes (no Clerk)
  const isLoaded = true
  const isSignedIn = false
  const user = null
  
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false)
  const { dictionary, locale } = useI18n()
  const isRtl = locale === "tn"
  
  // PWA installation states
  const [isPwaInstallable, setIsPwaInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isHome, setIsHome] = useState(true)
  
  // Use external expanded state if provided, otherwise use internal state
  const effectiveIsExpanded = externalIsExpanded !== undefined ? externalIsExpanded : isExpanded;

  useEffect(() => {
    if (pathname === `/${locale}` || pathname === `/${locale}/`) {
      setIsHome(true)
    } else {
      setIsHome(false)
    }
  }, [pathname, locale])

  const menuItems = [
    { 
      name: dictionary.sidebar?.chatWithNexie || 'Chat with Nexie', 
      iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwbSStfCipPIQVv9cY51AoJ62rheLUiRxBg7fl",
      darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwbSStfCipPIQVv9cY51AoJ62rheLUiRxBg7fl", 
      href: '/chat', 
      color: 'text-purple-500' 
    },
    {
      name: dictionary.sidebar?.studyHelp || 'Study Help',
      iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwInIjuz33xpJvki9ByXrdQzZ5SVlsRKDamhWP",
      darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwInIjuz33xpJvki9ByXrdQzZ5SVlsRKDamhWP",
      color: 'text-blue-500',
      items: [
        { 
          name: dictionary.sidebar?.documentChat || 'Document Chat', 
          iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwNd6F87IW0AdQnDBG8rk4z3qHMRZ5PaxoTFei", 
          darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwNd6F87IW0AdQnDBG8rk4z3qHMRZ5PaxoTFei", 
          href: '/document-chat', 
          color: 'text-green-500' 
        },
        { 
          name: dictionary.sidebar?.summarize || 'Summarize', 
          iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLw0uJILkzuRrLw4C2KtcOdXeZn5qyDMNm8EFAG", 
          darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLw0uJILkzuRrLw4C2KtcOdXeZn5qyDMNm8EFAG", 
          href: '/summarize', 
          color: 'text-yellow-500' 
        },
        { 
          name: dictionary.sidebar?.quizMaker || 'Quiz Maker', 
          iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwIeMgEI33xpJvki9ByXrdQzZ5SVlsRKDamhWP", 
          darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwIeMgEI33xpJvki9ByXrdQzZ5SVlsRKDamhWP", 
          href: '/quiz-maker', 
          color: 'text-red-500' 
        },
        { 
          name: dictionary.sidebar?.flashcardMaker || 'Flashcard Maker', 
          iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLws2N5dz8IO7XtAfQ6CZVc1NHr3nKiDbxvE0FY", 
          darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLws2N5dz8IO7XtAfQ6CZVc1NHr3nKiDbxvE0FY", 
          href: '/flashcard-maker', 
          color: 'text-indigo-500' 
        },
        { 
          name: dictionary.sidebar?.cheatsheetMaker || 'Cheatsheet Maker', 
          iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwarVcs49Izl1fY0o62BDrquNm8dXKOgtGRnyZ", 
          darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwarVcs49Izl1fY0o62BDrquNm8dXKOgtGRnyZ", 
          href: '/cheatsheet-maker', 
          color: 'text-pink-500' 
        },
        { 
          name: dictionary.sidebar?.feynmanTechnique || 'Feynman Technique', 
          iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwkkz57qlKYe18GpqbLc29CaTfUMh6dvuPDHz7", 
          darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwkkz57qlKYe18GpqbLc29CaTfUMh6dvuPDHz7", 
          href: '/feynman', 
          color: 'text-cyan-500' 
        },
        { 
          name: dictionary.sidebar?.exerciseGenerator || 'Exercise Generator', 
          iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwjsRTh2SQcdJ9fAL3aQs0zHOtpVyj7Xi1FPuE", 
          darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwjsRTh2SQcdJ9fAL3aQs0zHOtpVyj7Xi1FPuE", 
          href: '/exercise-generator', 
          color: 'text-orange-500' 
        },
        { 
          name: dictionary.sidebar?.assignmentChecker || 'Assignment Checker', 
          iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwkA4AeIlKYe18GpqbLc29CaTfUMh6dvuPDHz7", 
          darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwkA4AeIlKYe18GpqbLc29CaTfUMh6dvuPDHz7", 
          href: '/assignment-checker', 
          color: 'text-teal-500' 
        },
      ],
    },
    { 
      name: dictionary.sidebar?.pomodoroTimer || 'Pomodoro Timer', 
      iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwlA2Xmx78GCaSOHA4crsqN6xmZvByFj3UkdP1", 
      darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwlA2Xmx78GCaSOHA4crsqN6xmZvByFj3UkdP1", 
      href: '/pomodoro', 
      color: 'text-red-500' 
    },
    { 
      name: 'Study With Me', 
      iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwGn2MH0tlOi1MgWcuYfN2j4BaED6HFkSxL3tn", 
      darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwGn2MH0tlOi1MgWcuYfN2j4BaED6HFkSxL3tn", 
      href: 'https://discord.gg/a4eAryph87', 
      color: 'text-green-500' 
    },
    { 
      name: dictionary.sidebar?.journalPlanner || 'Journal Planner', 
      iconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwLqO567PjSeFGCUX1i8noqfRdNgsJIHaZOzVY", 
      darkIconSrc: "https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwLqO567PjSeFGCUX1i8noqfRdNgsJIHaZOzVY", 
      href: '/journalplanner', 
      color: 'text-green-500',
      comingSoon: true,
      disabled: true
    },
  ]

  const isPathActive = useCallback((href) => {
    if (!href || href === '#') return false
    return pathname.includes(href)
  }, [pathname])

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');
    
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPwaInstallable(true);
    };

    if (!isStandalone) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handlePwaInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      setIsPwaInstallable(false);
    }
  };

  useEffect(() => {
    const loadLocalStorageData = () => {
      const storedExpandedSections = localStorage.getItem('expandedSections')
      if (storedExpandedSections) {
        try {
          setExpandedSections(JSON.parse(storedExpandedSections))
        } catch (error) {
          console.error('Error parsing stored expanded sections:', error)
          setExpandedSections({})
          localStorage.removeItem('expandedSections')
        }
      }
      
      // Only manage internal state if no external state is provided
      if (externalIsExpanded === undefined) {
        const storedIsExpanded = localStorage.getItem('sidebarExpanded')
        if (storedIsExpanded !== null) {
          setIsExpanded(storedIsExpanded === 'true')
        } else {
          localStorage.setItem('sidebarExpanded', 'true')
          setIsExpanded(true)
        }
      }
    }
    loadLocalStorageData()
    
    // Auto-expand sections based on active path
    menuItems.forEach(item => {
      if (item.items) {
        const hasActiveChild = item.items.some(subItem => isPathActive(subItem.href))
        if (hasActiveChild) {
          setExpandedSections(prev => ({
            ...prev,
            [item.name]: true
          }))
        }
      }
    })
  }, [pathname, isPathActive, externalIsExpanded])

  const toggleExpand = useCallback(() => {
    if (onToggleExpand) {
      // Use external toggle function if provided
      onToggleExpand();
    } else {
      // Fallback to internal state management
      setIsExpanded(prev => {
        const newValue = !prev;
        localStorage.setItem('sidebarExpanded', newValue.toString());
        return newValue;
      });
    }
  }, [onToggleExpand])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newDarkMode = !prev
      localStorage.setItem('darkMode', newDarkMode.toString())
      if (newDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return newDarkMode
    })
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const toggleSection = useCallback((sectionName) => {
    setExpandedSections(prev => {
      const newExpandedSections = {
        ...prev,
        [sectionName]: !prev[sectionName]
      }
      try {
        localStorage.setItem('expandedSections', JSON.stringify(newExpandedSections))
      } catch (error) {
        console.error('Error storing expanded sections in localStorage:', error)
      }
      return newExpandedSections
    })
  }, [])

  const handleMenuItemClick = useCallback((itemName, href, disabled) => {
    if (disabled) return;
    
    setActiveItem(href)
    
    if (href.startsWith('http://') || href.startsWith('https://')) {
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      router.push(href)
    }
  }, [router])

  const handleSignOut = useCallback(() => {
    // Mock sign out for now
    router.push('/')
  }, [router])

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className="p-4 flex items-center justify-between">
        <div className='flex justify-center items-center'>
          <Image
            className={`${!effectiveIsExpanded && !isMobile ? 'hidden' : ''}`}
            src="https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwC5mratq5Az9VXH8BF0IkZUdTgcuet1i36Yyj"
            width={35}
            height={35}
            alt="NextGen Logo"
          />
          <Link href={`/${locale}`}>
            <h2 className={`text-xl font-bold mx-2 dark:text-[#79EFE8] text-[#51beb7] ${!effectiveIsExpanded && !isMobile ? 'hidden' : ''}`}>
              NextGen.tn
            </h2>
          </Link>
        </div>
       
        {isMobile ? (
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label={dictionary.sidebar?.closeMobileMenu || "Close mobile menu"}
          >
            <X size={24} />
          </button>
        ) : (
          <button
            onClick={toggleExpand}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label={effectiveIsExpanded ? dictionary.sidebar?.collapseSidebar || "Collapse sidebar" : dictionary.sidebar?.expandSidebar || "Expand sidebar"}
          >
            {effectiveIsExpanded ? (
              isRtl ? <ChevronRight size={24} /> : <ChevronLeft size={24} />
            ) : (
              isRtl ? <ChevronLeft size={24} /> : <ChevronRight size={24} />
            )}
          </button>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.items) {
            const hasActiveChild = item.items.some(subItem => isPathActive(subItem.href))
            
            return (
              <div key={item.name}>
                <button
                  onClick={() => {
                    toggleSection(item.name)
                    if (item.href && !item.disabled) {
                      handleMenuItemClick(item.name, item.href, item.disabled)
                    }
                  }}
                  className={`flex items-center w-full py-3 px-4 transition-colors hover:bg-teal-100 dark:hover:bg-gray-800 ${
                    hasActiveChild ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                  } ${!effectiveIsExpanded && !isMobile ? 'justify-center' : ''}`}
                >
                  <Image 
                    src={item.iconSrc || "/placeholder.svg"} 
                    alt={item.name} 
                    width={24} 
                    height={24} 
                    className={`${!effectiveIsExpanded && !isMobile ? '' : isRtl ? 'ml-3' : 'mr-3'} ${item.color === 'text-blue-500' ? 'filter-blue-500' : ''} dark:hidden`} 
                  />
                  <Image 
                    src={item.darkIconSrc || "/placeholder.svg"} 
                    alt={item.name} 
                    width={24} 
                    height={24} 
                    className={`${!effectiveIsExpanded && !isMobile ? '' : isRtl ? 'ml-3' : 'mr-3'} ${item.color === 'text-blue-500' ? 'filter-blue-500' : ''} hidden dark:block`} 
                  />
                  {(effectiveIsExpanded || isMobile) && (
                    <>
                      <span className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>{item.name}</span>
                      {expandedSections[item.name] ? (
                        <ChevronUp size={16} className={isRtl ? 'mr-2' : 'ml-2'} />
                      ) : (
                        <ChevronDown size={16} className={isRtl ? 'mr-2' : 'ml-2'} />
                      )}
                    </>
                  )}
                </button>
                {expandedSections[item.name] && (effectiveIsExpanded || isMobile) && (
                  <div className={isRtl ? 'mr-4' : 'ml-4'}>
                    {item.items.map((subItem) => {
                      const isActive = isPathActive(subItem.href)
                      return (
                        <button
                          key={subItem.name}
                          className={`flex items-center py-2 px-4 transition-colors w-full ${isRtl ? 'text-right' : 'text-left'} ${
                            isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          } ${subItem.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            handleMenuItemClick(subItem.name, subItem.href, subItem.disabled)
                          }}
                          disabled={subItem.disabled}
                          aria-label={subItem.name}
                        >
                          <Image 
                            src={subItem.iconSrc || "/placeholder.svg"} 
                            alt={subItem.name} 
                            width={20} 
                            height={20} 
                            className={`${isRtl ? 'ml-3' : 'mr-3'} dark:hidden`} 
                          />
                          <Image 
                            src={subItem.darkIconSrc || "/placeholder.svg"} 
                            alt={subItem.name} 
                            width={20} 
                            height={20} 
                            className={`${isRtl ? 'ml-3' : 'mr-3'} hidden dark:block`} 
                          />
                          <span>{subItem.name}</span>
                          {subItem.comingSoon && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-500 dark:bg-red-500 text-white rounded-full">
                              {dictionary.sidebar?.comingSoon || "Coming Soon !"}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          } else {
            const isActive = isPathActive(item.href)
            return (
              <button
                key={item.name}
                className={`flex items-center py-3 px-4 transition-colors w-full ${
                  isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${!effectiveIsExpanded && !isMobile ? 'justify-center' : ''} ${item.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleMenuItemClick(item.name, item.href, item.disabled)
                }}
                disabled={item.disabled}
                aria-label={item.name}
              >
                <Image 
                  src={item.iconSrc || "/placeholder.svg"} 
                  alt={item.name} 
                  width={24} 
                  height={24} 
                  className={`${!effectiveIsExpanded && !isMobile ? '' : isRtl ? 'ml-3' : 'mr-3'} dark:hidden`} 
                />
                <Image 
                  src={item.darkIconSrc || "/placeholder.svg"} 
                  alt={item.name} 
                  width={24} 
                  height={24} 
                  className={`${!effectiveIsExpanded && !isMobile ? '' : isRtl ? 'ml-3' : 'mr-3'} hidden dark:block`} 
                />
                {(effectiveIsExpanded || isMobile) && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.name}</span>
                    {item.comingSoon && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-500 dark:bg-red-500 text-white rounded-full">
                        {dictionary.sidebar?.comingSoon || "Coming Soon !"}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          }
        })}
        
        {(effectiveIsExpanded || isMobile) && (
          <div className="mt-4 px-4">
            <div className="flex items-center">
              <Image 
                src={"https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwSCip7KoYo498KjwQsXEl2NDVPRaWLF1bSgyd"} 
                alt={dictionary.sidebar?.workspace || "Workspace"} 
                width={24} 
                height={24} 
                className={`${isRtl ? 'ml-2' : 'mr-2'} dark:hidden`} 
              />
              <Image 
                src={"https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwSCip7KoYo498KjwQsXEl2NDVPRaWLF1bSgyd"} 
                alt={dictionary.sidebar?.workspace || "Workspace"} 
                width={24} 
                height={24} 
                className={`${isRtl ? 'ml-2' : 'mr-2'} hidden dark:block`} 
              />
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {dictionary.sidebar?.yourWorkspace || "Your Workspace"}
              </h3>
            </div>
            <Button
              onClick={() => {
                setIsWorkspaceDialogOpen(true)
                handleMenuItemClick('Workspace', '#')
              }}
              className="w-full mt-2 bg-blue-500 text-white dark:text-white hover:bg-blue-600 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {dictionary.sidebar?.comingSoon || "Coming Soon !"}
            </Button>
          </div>
        )}
      </nav>
      
      {/* PWA Install Button - For expanded sidebar */}
      {isPwaInstallable && ((effectiveIsExpanded && !isMobile) || isMobile) && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handlePwaInstall}
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white"
          >
            <Download size={16} />
            <span>{dictionary.sidebar?.installApp || "Install App"}</span>
          </Button>
        </div>
      )}
      
      {/* PWA Install Button - For collapsed sidebar */}
      {!effectiveIsExpanded && !isMobile && isPwaInstallable && (
        <div className="p-4 flex justify-center border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handlePwaInstall}
            className="p-2 rounded-full bg-teal-500 hover:bg-teal-600 text-white"
            aria-label={dictionary.sidebar?.installApp || "Install App"}
          >
            <Download size={20} />
          </Button>
        </div>
      )}
      
      {/* Dark Mode Toggle for collapsed sidebar */}
      {!effectiveIsExpanded && !isMobile && isLoaded && (
        <div className="p-4 flex justify-center">
          <DarkModeToggle />
        </div>
      )}
      
      {effectiveIsExpanded && !isSignedIn && isLoaded && (
        <div className="p-4 flex justify-center">
          <DarkModeToggle />
        </div>
      )}
      
      {/* User Profile Section with Dark Mode Toggle */}
      {isLoaded && isSignedIn && ((effectiveIsExpanded && !isMobile) || isMobile) && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                <Image 
                  src={user?.imageUrl || "/placeholder.svg?height=40&width=40"} 
                  alt={user?.fullName || "User"} 
                  width={40} 
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            
            <DarkModeToggle />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="mt-3 w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
          >
            <LogOut size={16} />
            <span>{dictionary.sidebar?.signOut || "Sign Out"}</span>
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`h-full bg-white ${isHome ? "dark:bg-black" : "dark:bg-gray-900"} text-gray-800 dark:text-gray-200 ${effectiveIsExpanded ? 'w-64' : 'w-16'} flex flex-col ${isRtl ? 'border-l' : 'border-r'} border-gray-200 dark:border-gray-700`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} 
        onClick={toggleMobileMenu}
        aria-hidden="true"
      ></div>
      <aside 
        className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-transform duration-300 ease-in-out transform ${
          isMobileMenuOpen 
            ? 'translate-x-0' 
            : isRtl ? 'translate-x-full' : '-translate-x-full'
        } md:hidden z-50 overflow-y-auto`}
        aria-label={dictionary.sidebar?.mobileSidebar || "Mobile sidebar"}
      >
        <SidebarContent isMobile={true} />
      </aside>

      {/* Workspace Feature Dialog */}
      <Dialog open={isWorkspaceDialogOpen} onOpenChange={setIsWorkspaceDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {dictionary.sidebar?.workspaceFeature || "Workspace Feature - Coming Soon!"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 dark:text-gray-300">
            {dictionary.sidebar?.workspaceDescription || "We're excited to announce our upcoming Workspace feature! This new functionality will allow you to:"}
          </p>
          <ul className="list-disc list-inside mt-2 mb-4 text-gray-700 dark:text-gray-300">
            <li>{dictionary.sidebar?.workspaceFeature1 || "Create custom workspaces for different subjects or projects"}</li>
            <li>{dictionary.sidebar?.workspaceFeature2 || "Organize your content within each workspace"}</li>
            <li>{dictionary.sidebar?.workspaceFeature3 || "Collaborate with others on shared workspaces"}</li>
            <li>{dictionary.sidebar?.workspaceFeature4 || "Use NextGen.tn features directly on your workspace content"}</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            {dictionary.sidebar?.workspaceStayTuned || "Stay tuned for updates on this exciting new feature that will enhance your learning and productivity experience!"}
          </p>
          <DialogFooter>
            <Button 
              onClick={() => setIsWorkspaceDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
            >
              {dictionary.common?.close || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
