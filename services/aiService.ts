
import { GoogleGenAI, Type } from "@google/genai";
import { storageService } from "./storageService";
import { ToolType, AIProvider } from "../types";

export const aiService = {
  generate: async (toolType: ToolType, defaultInstruction: string, prompt: string): Promise<string[]> => {
    const settings = storageService.getSettings();
    const systemInstruction = settings.customInstructions?.[toolType] || defaultInstruction;
    const provider = settings.provider || 'gemini';

    if (provider === 'gemini') {
      return aiService.generateGemini(settings.model, systemInstruction, prompt);
    } else {
      return aiService.generateOpenAICompatible(provider, settings.model, systemInstruction, prompt);
    }
  },

  generateGemini: async (model: string, system: string, prompt: string): Promise<string[]> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Native Gemini key not found. Please select a key in Settings.");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: system,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });

    const text = response.text;
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [text];
    } catch {
      return [text];
    }
  },

  generateOpenAICompatible: async (provider: AIProvider, model: string, system: string, prompt: string): Promise<string[]> => {
    const settings = storageService.getSettings();
    let apiKey = '';
    let url = '';

    switch (provider) {
      case 'openai':
        apiKey = settings.apiKeys.openai || '';
        url = 'https://api.openai.com/v1/chat/completions';
        break;
      case 'groq':
        apiKey = settings.apiKeys.groq || '';
        url = 'https://api.groq.com/openai/v1/chat/completions';
        break;
      case 'openrouter':
        apiKey = settings.apiKeys.openrouter || '';
        url = 'https://openrouter.ai/api/v1/chat/completions';
        break;
    }

    if (!apiKey) throw new Error(`API key for ${provider.toUpperCase()} not found. Add it in Settings.`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Prompt Vault'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system + " ALWAYS RESPOND ONLY WITH A VALID JSON ARRAY OF STRINGS." },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object') {
        const firstArray = Object.values(parsed).find(v => Array.isArray(v));
        if (firstArray) return firstArray as string[];
      }
      return [content];
    } catch {
      return [content];
    }
  },

  testConnection: async (provider: AIProvider, model: string, manualKey?: string) => {
    const settings = storageService.getSettings();
    const keyToTest = manualKey || (settings.apiKeys as any)[provider];

    try {
      if (provider === 'gemini') {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return false;
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model,
          contents: "ping",
          config: { maxOutputTokens: 5, thinkingConfig: { thinkingBudget: 0 } }
        });
        return !!response.text;
      } else {
        if (!keyToTest) return false;
        
        let url = '';
        if (provider === 'openai') url = 'https://api.openai.com/v1/models';
        if (provider === 'groq') url = 'https://api.groq.com/openai/v1/models';
        if (provider === 'openrouter') url = 'https://openrouter.ai/api/v1/auth/key';

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${keyToTest}` }
        });
        
        return response.ok;
      }
    } catch {
      return false;
    }
  }
};
