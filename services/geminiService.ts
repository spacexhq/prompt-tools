
import { GoogleGenAI, Type } from "@google/genai";
import { storageService } from "./storageService";
import { ToolType } from "../types";

export const geminiService = {
  generate: async (toolType: ToolType, defaultInstruction: string, prompt: string): Promise<string[]> => {
    const settings = storageService.getSettings();
    
    // Always create a fresh instance to ensure the latest selected API key is used
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("No API key selected. Please configure a key in Settings.");
    }

    const systemInstruction = settings.customInstructions?.[toolType] || defaultInstruction;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: settings.model || 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
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
      } catch (e) {
        return [text];
      }
    } catch (error: any) {
      console.error("Inference Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        storageService.saveSettings({ ...settings, hasKeySelected: false });
        throw new Error("Invalid or expired project key. Please re-select your key in Settings.");
      }
      throw new Error(error.message || "Failed to generate content");
    }
  },

  testConnection: async (model: string) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return false;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model,
        contents: "Respond with 'Connected' if the API key is working.",
        config: {
          maxOutputTokens: 10,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text?.includes("Connected") ?? false;
    } catch (error) {
      return false;
    }
  }
};
