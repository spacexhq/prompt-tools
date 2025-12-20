
import { Prompt, AppSettings, StorageKeys } from '../types';

export const storageService = {
  getPrompts: (): Prompt[] => {
    const data = localStorage.getItem(StorageKeys.PROMPTS);
    return data ? JSON.parse(data) : [];
  },

  savePrompts: (prompts: Prompt[]): void => {
    localStorage.setItem(StorageKeys.PROMPTS, JSON.stringify(prompts));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(StorageKeys.SETTINGS);
    const defaults: AppSettings = { 
      model: 'gemini-3-flash-preview', 
      isConfigured: true, 
      theme: 'light' 
    };
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  },

  saveSettings: (settings: AppSettings): void => {
    localStorage.setItem(StorageKeys.SETTINGS, JSON.stringify(settings));
    
    // Apply theme class to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};
