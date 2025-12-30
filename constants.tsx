
import { ToolType, ToolConfig, AIProvider } from './types';

export const CATEGORIES = [
  'General',
  'Coding',
  'Writing',
  'Marketing',
  'Business',
  'Academic',
  'Creative'
];

export interface ModelOption {
  id: string;
  name: string;
  provider: AIProvider;
}

export const AI_MODELS: ModelOption[] = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'gemini' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'gemini' },
  { id: 'gpt-4o', name: 'OpenAI GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini', provider: 'openai' },
  { id: 'llama-3.3-70b-versatile', name: 'Groq Llama 3.3 70B', provider: 'groq' },
  { id: 'mixtral-8x7b-32768', name: 'Groq Mixtral 8x7B', provider: 'groq' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'OpenRouter Qwen 2.5', provider: 'openrouter' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'OpenRouter Claude 3.5', provider: 'openrouter' },
];

export const TOOLS: Record<ToolType, ToolConfig> = {
  rephrase: {
    name: 'Word Rephraser',
    description: 'Rewrite your content while keeping the original meaning.',
    icon: 'RefreshCcw',
    systemPrompt: 'You are an expert editor. Provide 3 distinct variations of the input text by rephrasing it for clarity and engagement while preserving the original intent. Return a JSON array of strings.',
    userPromptTemplate: (input) => `Rephrase this text in 3 different ways:\n\n${input}`
  },
  improve: {
    name: 'Word Improver',
    description: 'Enhance vocabulary, flow, and structural impact.',
    icon: 'Zap',
    systemPrompt: 'You are a professional writing coach. Provide 3 distinct improved versions of the following text. Each version should progressively enhance vocabulary, fixing awkward phrasing and ensuring better flow. Return a JSON array of strings.',
    userPromptTemplate: (input) => `Improve this text in 3 different ways:\n\n${input}`
  },
  tone: {
    name: 'Tone Changer',
    description: 'Shift your writing to a specific emotional or professional tone.',
    icon: 'Type',
    systemPrompt: 'You are a communications specialist. Rewrite the input text to match the requested tone perfectly. Provide 3 distinct variations that embody that tone. Return a JSON array of strings.',
    userPromptTemplate: (input, tone) => `Rewrite this text in a ${tone} tone (3 variations):\n\n${input}`
  },
  summarize: {
    name: 'Summarizer',
    description: 'Condense long text into concise, actionable points.',
    icon: 'AlignLeft',
    systemPrompt: 'You are an efficient assistant. Provide 3 different summary formats: 1) A one-sentence summary, 2) A short paragraph, 3) A bulleted list of key takeaways. Return a JSON array of strings.',
    userPromptTemplate: (input) => `Summarize this text in 3 different formats:\n\n${input}`
  },
  expand: {
    name: 'Expander',
    description: 'Elaborate on short ideas with more detail and depth.',
    icon: 'Maximize2',
    systemPrompt: 'You are a creative writer. Provide 3 distinct expansions of the provided idea. One focusing on detail, one on context, and one on descriptive storytelling. Return a JSON array of strings.',
    userPromptTemplate: (input) => `Expand on this text in 3 different ways:\n\n${input}`
  }
};
