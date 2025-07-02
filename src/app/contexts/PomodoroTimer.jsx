'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PomodoroContext = createContext();

export function PomodoroProvider({ children }) {
  // Mock user for UI purposes
  const user = null;
  
  // Default settings
  const defaultSettings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    colorScheme: 'red',
    hourFormat: '24h'
  };

  // State
  const [settings, setSettings] = useState(defaultSettings);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [tasks, setTasks] = useState([]);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load from localStorage only for now
        const localSettings = localStorage.getItem('pomodoroSettings');
        if (localSettings) {
          const parsed = JSON.parse(localSettings);
          setSettings(parsed);
          setTime(parsed.pomodoro * 60);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      // Timer finished
      handleTimerComplete();
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, time]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    
    // Show notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = mode === 'pomodoro' ? 'Pomodoro Complete!' : 'Break Complete!';
      const body = mode === 'pomodoro' ? 'Time for a break!' : 'Time to focus!';
      
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    }

    // Auto-start next session if enabled
    if (mode === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);
      
      // Determine next break type
      const nextBreakType = (completedPomodoros + 1) % settings.longBreakInterval === 0 
        ? 'longBreak' 
        : 'shortBreak';
      
      if (settings.autoStartBreaks) {
        resetTimer(nextBreakType, true);
      } else {
        resetTimer(nextBreakType, false);
      }
    } else {
      // Break finished
      if (settings.autoStartPomodoros) {
        resetTimer('pomodoro', true);
      } else {
        resetTimer('pomodoro', false);
      }
    }
  }, [mode, completedPomodoros, settings]);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Toggle timer
  const toggleTimer = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  // Reset timer
  const resetTimer = useCallback((newMode = null, autoStart = false) => {
    const targetMode = newMode || mode;
    setMode(targetMode);
    setIsActive(autoStart);
    
    const timeMap = {
      pomodoro: settings.pomodoro * 60,
      shortBreak: settings.shortBreak * 60,
      longBreak: settings.longBreak * 60
    };
    
    setTime(timeMap[targetMode]);
  }, [mode, settings]);

  // Skip timer
  const skipTimer = useCallback(() => {
    handleTimerComplete();
  }, [handleTimerComplete]);

  // Update settings and reset timers
  const updateSettingsAndResetTimers = useCallback((newSettings) => {
    setSettings(newSettings);
    
    // Update current timer if not active
    if (!isActive) {
      const timeMap = {
        pomodoro: newSettings.pomodoro * 60,
        shortBreak: newSettings.shortBreak * 60,
        longBreak: newSettings.longBreak * 60
      };
      setTime(timeMap[mode]);
    }
    
    // Save to localStorage only for now
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
  }, [isActive, mode, tasks]);

  // Add task
  const addTask = useCallback((task) => {
    const newTask = {
      id: Date.now().toString(),
      text: task,
      completed: false,
      pomodoros: 0,
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, newTask]);
  }, []);

  // Update task
  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  // Delete task
  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const value = {
    // State
    settings,
    time,
    isActive,
    mode,
    completedPomodoros,
    tasks,
    
    // Actions
    setSettings,
    toggleTimer,
    resetTimer,
    skipTimer,
    formatTime,
    updateSettingsAndResetTimers,
    addTask,
    updateTask,
    deleteTask
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within PomodoroProvider');
  }
  return context;
}
