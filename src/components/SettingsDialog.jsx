import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savePomodoroSettings } from '@/actions/pomodoro';
import { useI18n } from '@/app/i18n/client';
import { cn } from '@/lib/utils';
import { usePomodoro } from '@/app/contexts/PomodoroTimer';

export function SettingsDialog({ settings, setSettings, isOpen, setIsOpen, tasks, userId }) {
  const { dictionary, locale } = useI18n();
  const isRtl = locale === 'tn';
  
  const [tempSettings, setTempSettings] = React.useState(settings);
  const { updateSettingsAndResetTimers } = usePomodoro();

  React.useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSave = () => {
    // Use the new function that updates settings and resets timers
    updateSettingsAndResetTimers(tempSettings);
    
    // Close the dialog
    setIsOpen(false);
    
    // Save to database if needed
    if (userId) {
      savePomodoroSettings(userId, tempSettings, tasks).catch(error => {
        console.error('Failed to save settings to database:', error);
      });
    }
  };
  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroSettings', JSON.stringify(tempSettings));
    }
    if (userId) {
      savePomodoroSettings(userId, tempSettings, tasks).catch(error => {
        console.error('Failed to save settings to database:', error);
      });
    }
  };

  // Ensure timer values are always within valid ranges
  const handleTimerChange = (field, value) => {
    // Parse the input value to a number, default to 1 if invalid
    const numValue = parseInt(value) || 1;
    
    // Define max values for each timer type
    const maxValues = {
      pomodoro: 120,      // Max 120 minutes for pomodoro
      shortBreak: 60,     // Max 60 minutes for short break
      longBreak: 10,      // Max 10 minutes for long break
      longBreakInterval: 10 // Max 10 intervals (reasonable limit)
    };
    
    // Ensure the value is at least 1 and not more than the max value
    const safeValue = Math.min(Math.max(1, numValue), maxValues[field] || 120);
    
    setTempSettings({
      ...tempSettings,
      [field]: safeValue
    });
  };

  // Color scheme button renderer with proper Tailwind classes
  const renderColorButton = (color) => {
    const baseClasses = "w-6 h-6 rounded-full";
    const selectedClasses = "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 dark:ring-gray-300";
    
    let colorClasses = "";
    if (color === 'red') colorClasses = "bg-red-500";
    else if (color === 'teal') colorClasses = "bg-teal-500";
    else if (color === 'blue') colorClasses = "bg-blue-500";
    
    return (
      <button
        key={color}
        onClick={() => setTempSettings({...tempSettings, colorScheme: color})}
        className={cn(
          baseClasses,
          colorClasses,
          tempSettings.colorScheme === color ? selectedClasses : ""
        )}
        aria-label={`${color} color scheme`}
      />
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-lg" dir={isRtl ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-normal text-gray-900 dark:text-gray-100">
            {dictionary.settingsDialog.setting}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className={`flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className={isRtl ? 'ml-2' : 'mr-2'}>⏲️</span>
              {dictionary.settingsDialog.timer}
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-300">
                  {dictionary.settingsDialog.timeMinutes}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      {dictionary.pomodoroTimer.pomodoro}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={tempSettings.pomodoro}
                      onChange={(e) => handleTimerChange('pomodoro', e.target.value)}
                      className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    />
                   </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      {dictionary.pomodoroTimer.shortBreak}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={tempSettings.shortBreak}
                      onChange={(e) => handleTimerChange('shortBreak', e.target.value)}
                      className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    />
                   </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      {dictionary.pomodoroTimer.longBreak}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={tempSettings.longBreak}
                      onChange={(e) => handleTimerChange('longBreak', e.target.value)}
                      className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    />
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700 dark:text-gray-300">
                    {dictionary.settingsDialog.autoStartBreaks}
                  </Label>
                  <Switch
                    checked={tempSettings.autoStartBreaks}
                    onCheckedChange={(checked) => setTempSettings({...tempSettings, autoStartBreaks: checked})}
                    className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700 dark:text-gray-300">
                    {dictionary.settingsDialog.autoStartPomodoros}
                  </Label>
                  <Switch
                    checked={tempSettings.autoStartPomodoros}
                    onCheckedChange={(checked) => setTempSettings({...tempSettings, autoStartPomodoros: checked})}
                    className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700 dark:text-gray-300">
                    {dictionary.settingsDialog.longBreakInterval}
                  </Label>
                  <div className="flex flex-col items-end">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={tempSettings.longBreakInterval}
                      onChange={(e) => handleTimerChange('longBreakInterval', e.target.value)}
                      className="w-20 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    />
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             
            <div className="space-y-4">
              
              <div className="flex justify-between items-center">
                <Label className="text-gray-700 dark:text-gray-300">
                  {dictionary.settingsDialog.hourFormat}
                </Label>
                <Select
                  value={tempSettings.hourFormat}
                  onValueChange={(value) => setTempSettings({...tempSettings, hourFormat: value})}
                >
                  <SelectTrigger className="w-32 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border dark:border-gray-800">
                    <SelectItem value="12h" className="text-gray-900 dark:text-gray-100">{dictionary.settingsDialog.format12h}</SelectItem>
                    <SelectItem value="24h" className="text-gray-900 dark:text-gray-100">{dictionary.settingsDialog.format24h}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
            </div>
          </div>
        </div>
        <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} mt-6`}>
          <Button
            onClick={handleSave}
            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 
              hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            {dictionary.common.ok}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}