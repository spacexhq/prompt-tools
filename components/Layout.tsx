
import React from 'react';
import { 
  LayoutDashboard, 
  FolderLock, 
  Wand2, 
  Settings as SettingsIcon,
  Sun,
  Moon
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const [theme, setTheme] = React.useState(storageService.getSettings().theme);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'vault', label: 'Vault', icon: FolderLock },
    { id: 'tools', label: 'Tools', icon: Wand2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    const settings = storageService.getSettings();
    storageService.saveSettings({ ...settings, theme: newTheme });
    setTheme(newTheme);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-200">
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-950 dark:border-slate-800 px-4 py-2 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 dark:bg-slate-800 p-1 rounded-none">
            <FolderLock className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-950 dark:text-white tracking-tighter text-sm uppercase">PromptVault</span>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-950 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-56 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col transition-colors duration-200">
          <div className="p-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            <div className="bg-slate-950 dark:bg-slate-800 p-1.5 rounded-none">
              <FolderLock className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-950 dark:text-white text-sm tracking-widest uppercase">PromptVault</span>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id || (activeView.startsWith('tool-') && item.id === 'tools');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-none transition-all text-xs font-bold uppercase tracking-wider ${
                    isActive 
                      ? 'bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0 relative bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-200">
          <div className="max-w-5xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-950 dark:border-slate-800 px-1 py-1 flex justify-around items-center z-30 transition-colors duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id || (activeView.startsWith('tool-') && item.id === 'tools');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-none transition-all ${
                isActive ? 'text-slate-950 dark:text-white' : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className={`text-[9px] mt-1 font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
