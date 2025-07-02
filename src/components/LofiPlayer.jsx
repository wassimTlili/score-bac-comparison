// components/LofiPlayer.jsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { saveLofiSettings, getLofiSettings } from '@/actions/pomodoro';
import { useI18n } from '@/app/i18n/client';

const tracks = [
  {
    title: "Set Sail",
    artist: "Lofi Beats",
    audioUrl: "https://utfs.io/f/47bf96cc-f5f1-4376-92dd-4e74e39de024-dy2ss5.mp3",
    coverUrl: "https://utfs.io/f/01bfbcb1-7ec2-4fee-9499-6e5863181ffe-s2s61b.jpg"
  },
  {
    title: "Learn",
    artist: "Lofi Beats",
    audioUrl: "https://utfs.io/f/9fd838ef-6554-49c3-a6af-e6f13f286aa7-fsvk85.mp3",
    coverUrl: "https://utfs.io/f/01bfbcb1-7ec2-4fee-9499-6e5863181ffe-s2s61b.jpg"
  },
  {
    title: "L'Aperitivo",
    artist: "Lofi Beats",
    audioUrl: "https://utfs.io/f/1f17a4a1-2e5c-44f0-9fcd-75c213b3b1ee-9ln7ff.mp3",
    coverUrl: "https://utfs.io/f/01bfbcb1-7ec2-4fee-9499-6e5863181ffe-s2s61b.jpg"
  },
  {
    title: "Rooftop Café",
    artist: "Lofi Beats",
    audioUrl: "https://utfs.io/f/d921cb51-f28d-435e-b858-b9cae600df5e-7rbvfb.mp3",
    coverUrl: "https://utfs.io/f/01bfbcb1-7ec2-4fee-9499-6e5863181ffe-s2s61b.jpg"
  },
  {
    title: "Brigh",
    artist: "Lofi Beats",
    audioUrl: "https://utfs.io/f/79692355-6eb2-4def-bc0c-a92c8b853b3a-n37qlp.mp3",
    coverUrl: "https://utfs.io/f/01bfbcb1-7ec2-4fee-9499-6e5863181ffe-s2s61b.jpg"
  }
];

export default function LofiPlayer({ userId }) {
  const { dictionary, locale } = useI18n();
  const isRTL = locale === 'tn';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [expandedPlayerHeight, setExpandedPlayerHeight] = useState(0);
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const isInitialLoad = useRef(true);
  const playerRef = useRef(null);
  const expandedPlayerRef = useRef(null);

  // Update window height on resize
  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowHeight(window.innerHeight);
    };
    
    // Set initial dimensions
    updateWindowDimensions();
    
    // Add event listener
    window.addEventListener('resize', updateWindowDimensions);
    
    // Clean up
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  // Update expanded player height when it changes
  useEffect(() => {
    if (isPlayerExpanded && expandedPlayerRef.current) {
      const height = expandedPlayerRef.current.offsetHeight;
      setExpandedPlayerHeight(height);
    }
  }, [isPlayerExpanded]);

  // Adjust position if expanded player would overflow the viewport
  useEffect(() => {
    if (isPlayerExpanded && playerRef.current && expandedPlayerRef.current) {
      const playerRect = playerRef.current.getBoundingClientRect();
      const expandedHeight = expandedPlayerRef.current.offsetHeight;
      const bottomSpace = window.innerHeight - playerRect.bottom;
      
      // If there's not enough space below, position it above
      if (expandedHeight > bottomSpace && playerRect.top > expandedHeight) {
        expandedPlayerRef.current.style.bottom = '100%';
        expandedPlayerRef.current.style.top = 'auto';
      } else {
        expandedPlayerRef.current.style.top = '100%';
        expandedPlayerRef.current.style.bottom = 'auto';
      }
    }
  }, [isPlayerExpanded, expandedPlayerHeight, windowHeight]);

  // Load settings and song progress from localStorage and database
  useEffect(() => {
    const loadSettings = async () => {
      let lofiSettings;
      if (typeof window !== 'undefined') {
        const storedSettings = localStorage.getItem('lofiSettings');
        if (storedSettings) {
          lofiSettings = JSON.parse(storedSettings);
        }
      }
      if (!lofiSettings && userId) {
        const result = await getLofiSettings(userId);
        if (result.success && result.data) {
          const settings = result.data.settings;
          if (settings) {
            lofiSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;
          }
        }
      }
      if (lofiSettings) {
        setCurrentTrackIndex(lofiSettings.currentTrackIndex || 0);
        setVolume(lofiSettings.volume || 0.5);
        setIsMuted(lofiSettings.isMuted || false);
        
        // Set the saved progress if it exists
        if (lofiSettings.currentTime !== undefined) {
          setCurrentTime(lofiSettings.currentTime);
          // We'll set the audio element's currentTime after it's loaded
          isInitialLoad.current = true;
        }
      }
    };
    loadSettings();
  }, [userId]);

  // Close player when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (playerRef.current && !playerRef.current.contains(event.target) && isPlayerExpanded) {
        setIsPlayerExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPlayerExpanded]);

  // Save settings to localStorage and database
  useEffect(() => {
    const saveSettings = async () => {
      const settings = { 
        currentTrackIndex, 
        volume,
        isMuted,
        currentTime
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('lofiSettings', JSON.stringify(settings));
      }
    };
    
    // Don't save on initial mount
    const timeoutId = setTimeout(() => {
      saveSettings();
    }, 1000); // Debounce to avoid too many saves
    
    return () => clearTimeout(timeoutId);
  }, [currentTrackIndex, volume, isMuted, currentTime, userId]);

  // Save current time periodically while playing
  useEffect(() => {
    let saveInterval;
    
    if (isPlaying) {
      // Save current time every 5 seconds while playing
      saveInterval = setInterval(() => {
        if (audioRef.current) {
          const settings = JSON.parse(localStorage.getItem('lofiSettings') || '{}');
          settings.currentTime = audioRef.current.currentTime;
          localStorage.setItem('lofiSettings', JSON.stringify(settings));
          
          if (userId) {
            saveLofiSettings(userId, settings);
          }
        }
      }, 5000);
    }
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [isPlaying, userId]);

  // Set volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle play/pause and track progress
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
      
      // Start tracking progress
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 1000);
    } else {
      audioRef.current.pause();
      
      // Clear interval when paused
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentTrackIndex]);

  // Handle audio metadata loaded - set duration and restore playback position
  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      
      // If this is the initial load and we have a saved position, restore it
      if (isInitialLoad.current && currentTime > 0) {
        audioRef.current.currentTime = currentTime;
        isInitialLoad.current = false;
      }
    }
  };

  // Save current time before unloading the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (audioRef.current) {
        const settings = JSON.parse(localStorage.getItem('lofiSettings') || '{}');
        settings.currentTime = audioRef.current.currentTime;
        localStorage.setItem('lofiSettings', JSON.stringify(settings));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const togglePlayPause = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsPlaying(!isPlaying);
  };

  const playTrack = (index) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
    isInitialLoad.current = false; // Reset initial load flag when manually changing tracks
  };

  const playNextTrack = (e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(nextIndex);
  };

  const playPreviousTrack = (e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    // If we're more than 3 seconds into the track, restart it instead of going to previous
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }
    
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrack(prevIndex);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume[0]);
    setIsMuted(false);
  };

  const toggleMute = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsMuted(!isMuted);
  };

  const formatTrackTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (newValue) => {
    if (audioRef.current) {
      const newTime = (newValue[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const togglePlayerExpansion = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsPlayerExpanded(!isPlayerExpanded);
  };

  // Calculate dynamic max height for track list based on screen size
  const getTrackListMaxHeight = () => {
    // On small screens, limit to 30% of viewport height
    if (windowHeight < 600) {
      return 'max-h-[30vh]';
    }
    // On medium screens, limit to 35% of viewport height
    else if (windowHeight < 900) {
      return 'max-h-[35vh]';
    }
    // On large screens, use fixed height
    else {
      return 'max-h-48';
    }
  };

  // Calculate album art size based on screen size
  const getAlbumArtSize = () => {
    if (windowHeight < 600) {
      return 'w-24 h-24';
    } else if (windowHeight < 900) {
      return 'w-32 h-32';
    } else {
      return 'w-40 h-40';
    }
  };

  return (
    <div className="relative" ref={playerRef}>
      <div className="hidden md:block">
        <div 
          className="bg-slate-600 dark:bg-slate-800 w-48 sm:w-80 rounded-lg flex justify-between shadow-md mx-1 sm:mx-3 items-center px-2 sm:px-3 cursor-pointer"
          onClick={togglePlayerExpansion}
        >
          <div className="flex items-center">
            <div className="flex w-8 h-8 sm:w-10 sm:h-10">
              <Image 
                src={tracks[currentTrackIndex].coverUrl || "/placeholder.svg"}
                className="rounded-2xl" 
                width={100} 
                height={100} 
                alt={dictionary.musicPlayer?.image || "music image"} 
              />
            </div>
            <div className="hidden sm:flex flex-col mx-2 sm:mx-4 py-1">
              <h1 className="mb-[1px] leading-none text-white text-[1.6vh] sm:text-[1.8vh]">{tracks[currentTrackIndex].title}</h1>
              <h1 className="leading-none text-slate-300 dark:text-slate-400 text-[80%] sm:text-[90%] text-left">{tracks[currentTrackIndex].artist}</h1>
            </div>
          </div>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1 sm:space-x-2`}>
            <button onClick={playPreviousTrack} className="hidden sm:block">
              <Image 
                src="https://utfs.io/f/5825941f-8c60-4e37-9874-252f79fffd38-5nxkzg.png" 
                className={`w-[18px] sm:w-[22px] ${isRTL ? 'transform rotate-180' : ''}`} 
                width={26} 
                height={26} 
                alt={dictionary.musicPlayer?.previous || "Previous"} 
              />
            </button>
            <button onClick={togglePlayPause}>
              <Image
                src={isPlaying ? "https://utfs.io/f/72a2051c-1b93-4020-9bfd-0e2ca030085f-1rddrq.png" : "https://utfs.io/f/0065ad6b-50f5-4fec-b586-247e81115f89-21t10.png"}
                className="mx-1 sm:mx-2 w-[20px] sm:w-[26px]"
                width={26}
                height={26}
                alt={dictionary.musicPlayer?.playPause || "Play/Pause"}
              />
            </button>
            <button onClick={playNextTrack} className="hidden sm:block">
              <Image 
                src="https://utfs.io/f/707bc074-51bf-475c-a783-98e1100bc03c-dnkchm.png" 
                className={`w-[16px] sm:w-[20px] ${isRTL ? 'transform rotate-180' : ''}`} 
                width={26} 
                height={26} 
                alt={dictionary.musicPlayer?.next || "Next"} 
              />
            </button>
            <button onClick={togglePlayerExpansion} className="focus:outline-none">
              {isPlayerExpanded ? (
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              ) : (
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={tracks[currentTrackIndex].audioUrl}
        onEnded={playNextTrack}
        onLoadedMetadata={handleMetadataLoaded}
      />

      {/* Expanded Player */}
      {isPlayerExpanded && (
        <div 
          ref={expandedPlayerRef}
          className={`absolute ${isRTL ? 'left-0 md:left-4' : 'right-0 md:right-4'} top-full z-50 mt-1 w-full md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out max-h-[80vh] flex flex-col`}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
        >
          <div className="p-3 sm:p-4 overflow-y-auto flex-shrink-0">
            {/* Album Art and Track Info */}
            <div className="flex flex-col items-center mb-3 sm:mb-4">
              <div className={`${getAlbumArtSize()} mb-2 sm:mb-4`}>
                <Image 
                  src={tracks[currentTrackIndex].coverUrl || "/placeholder.svg"}
                  className="rounded-lg shadow-md object-cover" 
                  width={160} 
                  height={160} 
                  alt={tracks[currentTrackIndex].title} 
                />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{tracks[currentTrackIndex].title}</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{tracks[currentTrackIndex].artist}</p>
            </div>

            {/* Progress Bar - Always LTR for time progress */}
            <div className="mb-3 sm:mb-4 progress-bar" dir="ltr">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>{formatTrackTime(currentTime)}</span>
                <span>{formatTrackTime(duration)}</span>
              </div>
              <Slider 
                value={[duration ? (currentTime / duration) * 100 : 0]} 
                onValueChange={handleProgressChange}
                max={100}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Controls */}
            <div className={`flex justify-center items-center space-x-4 sm:space-x-6 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <button 
                onClick={isRTL ? playNextTrack : playPreviousTrack}
                className="focus:outline-none text-gray-700 dark:text-gray-300"
              >
                <SkipBack className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button 
                onClick={togglePlayPause}
                className="focus:outline-none bg-blue-500 text-white rounded-full p-2 sm:p-3"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Play className={`h-5 w-5 sm:h-6 sm:w-6 ${isRTL ? 'transform rotate-180' : ''}`} />
                )}
              </button>
              <button 
                onClick={isRTL ? playPreviousTrack : playNextTrack}
                className="focus:outline-none text-gray-700 dark:text-gray-300"
              >
                <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Volume Control */}
            <div className={`flex items-center space-x-2 mt-3 sm:mt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <button onClick={toggleMute} className="focus:outline-none">
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              <Slider 
                value={[volume * 100]} 
                onValueChange={(v) => handleVolumeChange([v[0] / 100])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Track Selection */}
          <div className="border-t border-gray-200 dark:border-gray-700 flex-grow overflow-hidden flex flex-col">
            <h3 className={`px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 sticky top-0 z-10 ${isRTL ? 'text-right' : 'text-left'} flex-shrink-0`}>
              {dictionary.musicPlayer?.tracks || "Tracks"}
            </h3>
            {/* Dynamic height container with proper overflow */}
            <div className={`${getTrackListMaxHeight()} overflow-y-auto flex-grow`}>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {tracks.map((track, index) => (
                  <li 
                    key={index}
                    className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                      currentTrackIndex === index ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                    onClick={() => playTrack(index)}
                  >
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 relative flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
                        <Image 
                          src={track.coverUrl || "/placeholder.svg"}
                          className="rounded object-cover" 
                          width={32} 
                          height={32} 
                          alt={track.title} 
                        />
                        {currentTrackIndex === index && isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                          </div>
                        )}
                      </div>
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{track.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}