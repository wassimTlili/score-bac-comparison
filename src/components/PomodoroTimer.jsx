// PomodoroTimer.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SkipForward, Settings } from 'lucide-react';
import { SettingsDialog } from './SettingsDialog';
import { useI18n } from '@/app/i18n/client';

export function PomodoroTimer({ 
  time, 
  isActive, 
  mode, 
  toggleTimer, 
  resetTimer, 
  formatTime, 
  currentTask, 
  settings, 
  setSettings,
  isSettingsOpen,
  setIsSettingsOpen,
  skipTimer,
  tasks,
  userId
}) {
  const { dictionary, locale } = useI18n();
  const isRtl = locale === 'tn';
   //red , teal , blue 
  const getBackgroundColor = () => {
    if (isActive && mode === 'pomodoro') {
      return 'bg-black';
    }
   
    switch (mode) {
      case 'pomodoro':
        return `bg-[#c15c5c] dark:bg-[#c15c5c]`;
      case 'shortBreak':
        return 'bg-[#4C9196] dark:bg-[#4C9196]';
      case 'longBreak':
        return 'bg-[#4D7FA2] dark:bg-[#4D7FA2]';
      default:
        return `bg-[#c15c5c] dark:bg-[#c15c5c]`;
    }
  };

  const getButtonColor = () => {
    if (isActive) {
      return 'bg-white text-black hover:bg-gray-200';
    }
    switch (mode) {
      case 'pomodoro':
        return `bg-white text-[#c15c5c] hover:bg-red-50 dark:bg-white dark:text-[#c15c5c] dark:hover:bg-red-50`;
      case 'shortBreak':
        return 'bg-white text-[#4C9196] hover:bg-teal-50 dark:bg-white dark:text-[#4C9196] dark:hover:bg-teal-50';
      case 'longBreak':
        return 'bg-white text-[#4D7FA2] hover:bg-blue-50 dark:bg-white dark:text-[#4D7FA2] dark:hover:bg-blue-50';
      default:
        return `bg-white text-[#c15c5c] hover:bg-red-50 dark:bg-white dark:text-[#c15c5c] dark:hover:bg-red-50`;
    }
  };

  return (
    <Card className={`w-full max-w-md ${getBackgroundColor()} text-white mt-8 transition-colors duration-300`} dir={isRtl ? 'rtl' : 'ltr'}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className={`${isRtl ? 'space-x-reverse' : ''} space-x-2`}>
            <Button 
              variant={mode === 'pomodoro' ? 'secondary' : 'ghost'} 
              onClick={() => resetTimer('pomodoro')}
              disabled={isActive}
            >
              {dictionary.pomodoroTimer.pomodoro}
            </Button>
            <Button 
              variant={mode === 'shortBreak' ? 'secondary' : 'ghost'} 
              onClick={() => resetTimer('shortBreak')}
              disabled={isActive}
            >
              {dictionary.pomodoroTimer.shortBreak}
            </Button>
            <Button 
              variant={mode === 'longBreak' ? 'secondary' : 'ghost'} 
              onClick={() => resetTimer('longBreak')}
              disabled={isActive}
            >
              {dictionary.pomodoroTimer.longBreak}
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSettingsOpen(true)}
            disabled={isActive}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center">
          <div className="text-8xl font-bold mb-8">{formatTime(time)}</div>
          <div className={`flex justify-center items-center ${isRtl ? 'space-x-reverse' : ''} space-x-2`}>
            <Button 
              onClick={toggleTimer} 
              size="lg" 
              className={`text-xl py-6 ${getButtonColor()} transition-colors duration-300 ${isActive ? 'w-auto px-8' : 'w-full'}`}
            >
              {isActive ? dictionary.pomodoroTimer.pause : dictionary.pomodoroTimer.start}
            </Button>
            {isActive && (
              <Button
                onClick={skipTimer}
                variant="ghost"
                size="icon"
                className="h-[60px] w-[60px] transition-all duration-300"
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
        {currentTask && (
          <div className="mt-4 text-center">
            <p className="text-lg">{dictionary.pomodoroTimer.currentTask}</p>
            <p className="text-xl font-bold">{currentTask.text}</p>
          </div>
        )}
      </CardContent>
      <SettingsDialog 
        settings={settings}
        setSettings={setSettings}
        isOpen={isSettingsOpen}
        setIsOpen={setIsSettingsOpen}
        tasks={tasks}
        userId={userId}
        resetTimer={resetTimer}  // Add this prop
        currentMode={mode} 
      />
    </Card>
  );
}