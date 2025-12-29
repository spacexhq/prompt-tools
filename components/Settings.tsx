
import React from 'react';
import { AppSettings, ToolType, AIProvider } from '../types';
import { AI_MODELS, TOOLS } from '../constants';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { AlertCircle, CheckCircle2, Loader2, Save, Cpu, FlaskConical, ChevronDown, ChevronUp, Key, ExternalLink, Globe, Zap, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';

type ValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'missing';

const Settings: React.FC = () => {
  const [settings, setSettings] = React.useState<AppSettings>(storageService.getSettings());
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<'success' | 'error' | null>(null);
  const [expandedTool, setExpandedTool] = React.useState<ToolType | null>(null);
  const [showKeys, setShowKeys] = React.useState<Record<string, boolean>>({});
  
  // Validation states
  const [valStatuses, setValStatuses] = React.useState<Record<string, ValidationStatus>>({
    openai: 'idle',
    groq: 'idle',
    openrouter: 'idle'
  });

  const aistudio = (window as any).aistudio;

  // Auto-test effect with debounce
  React.useEffect(() => {
    const providers = ['openai', 'groq', 'openrouter'] as const;
    
    const timers = providers.map(p => {
      const key = settings.apiKeys[p];
      
      if (!key || key.trim() === '') {
        setValStatuses(prev => ({ ...prev, [p]: 'missing' }));
        return null;
      }

      setValStatuses(prev => ({ ...prev, [p]: 'checking' }));
      
      return setTimeout(async () => {
        const isValid = await aiService.testConnection(p as AIProvider, '', key);
        setValStatuses(prev => ({ ...prev, [p]: isValid ? 'valid' : 'invalid' }));
      }, 1000); // 1s debounce
    });

    return () => timers.forEach(t => t && clearTimeout(t));
  }, [settings.apiKeys]);

  const handleOpenGeminiKey = async () => {
    if (aistudio?.openSelectKey) {
      await aistudio.openSelectKey();
      setSettings(prev => ({ ...prev, hasKeySelected: true }));
    }
  };

  const updateKey = (provider: string, val: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [provider]: val }
    }));
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSave = () => {
    storageService.saveSettings({ ...settings, isConfigured: true });
    alert('CONFIGURATION COMMITTED');
  };

  const testConnection = async () => {
    setIsTesting(true); setTestResult(null);
    try {
      const ok = await aiService.testConnection(settings.provider, settings.model);
      setTestResult(ok ? 'success' : 'error');
    } catch { setTestResult('error'); }
    finally { setIsTesting(false); }
  };

  const handleModelChange = (modelId: string) => {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (model) {
      setSettings(prev => ({ ...prev, model: modelId, provider: model.provider }));
    }
  };

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'checking': return <Loader2 className="w-3 h-3 animate-spin text-slate-400" />;
      case 'valid': return <ShieldCheck className="w-3 h-3 text-green-500" />;
      case 'invalid': return <ShieldAlert className="w-3 h-3 text-rose-500" />;
      case 'missing': return <span className="text-[7px] font-bold text-rose-400 uppercase">Key Required</span>;
      default: return null;
    }
  };

  const getBorderColor = (status: ValidationStatus) => {
    switch (status) {
      case 'valid': return 'border-green-500/50 dark:border-green-500/30';
      case 'invalid': return 'border-rose-500/50 dark:border-rose-500/30';
      case 'missing': return 'border-rose-200 dark:border-rose-900/40';
      default: return 'border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white uppercase tracking-tight">Configuration</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Validated Cross-Provider Logic</p>
      </div>

      <div className="space-y-6">
        {/* Universal Keychain */}
        <section className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h2 className="text-[10px] font-bold text-slate-950 dark:text-white uppercase tracking-widest">Global Keychain</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Native Gemini */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-950 dark:text-white">Gemini (Native)</span>
                <span className={`h-1.5 w-1.5 rounded-full ${settings.hasKeySelected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              </div>
              <button onClick={handleOpenGeminiKey} className="w-full text-left px-4 py-2 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between">
                <span>{settings.hasKeySelected ? 'Project Key Linked' : 'Connect GCP Project'}</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </button>
            </div>

            {/* Manual Providers */}
            {['openai', 'groq', 'openrouter'].map((provider) => (
              <div key={provider} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-950 dark:text-white">{provider}</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(valStatuses[provider])}
                  </div>
                </div>
                <div className="relative">
                  <input 
                    type={showKeys[provider] ? "text" : "password"}
                    placeholder={`ENTER ${provider.toUpperCase()} API KEY`}
                    className={`w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border ${getBorderColor(valStatuses[provider])} font-mono text-[10px] dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none transition-all`}
                    value={(settings.apiKeys as any)[provider] || ''}
                    onChange={(e) => updateKey(provider, e.target.value)}
                  />
                  <button 
                    onClick={() => toggleKeyVisibility(provider)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  >
                    {showKeys[provider] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                {valStatuses[provider] === 'invalid' && (
                  <p className="text-[8px] font-bold text-rose-500 uppercase tracking-tighter">Handshake failed: Invalid credentials</p>
                )}
                {valStatuses[provider] === 'valid' && (
                  <p className="text-[8px] font-bold text-green-500 uppercase tracking-tighter">Connection verified</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Engine Selection */}
        <section className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <Cpu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h2 className="text-[10px] font-bold text-slate-950 dark:text-white uppercase tracking-widest">Active Inference Engine</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Model Architecture</label>
                <select 
                  className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-[11px] dark:text-white focus:outline-none"
                  value={settings.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                >
                  {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={testConnection}
                  disabled={isTesting}
                  className="w-full py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold uppercase tracking-widest text-[9px] active:scale-95 disabled:opacity-50 transition-all h-[38px]"
                >
                  {isTesting ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'TEST ENDPOINT'}
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-4 flex items-center gap-3 border ${testResult === 'success' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50' : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'}`}>
                {testResult === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                <p className="text-[10px] font-bold uppercase tracking-tight">
                  {testResult === 'success' ? `Global Handshake successful with ${settings.provider.toUpperCase()}` : 'Global Handshake failure'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Global Save */}
        <button 
          onClick={handleSave}
          className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-4 rounded-none font-bold uppercase tracking-[0.3em] hover:bg-slate-800 dark:hover:bg-slate-100 transition-all text-[11px] active:scale-95"
        >
          Commit All Keys & Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
