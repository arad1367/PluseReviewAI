export type ProviderID = "anthropic" | "openai" | "google" | "groq" | "openrouter";

export interface ProviderConfig {
  id: ProviderID;
  name: string;
  models: { id: string; label: string }[];
  free: boolean;
  freeNote?: string;
  keyPlaceholder: string;
  keyPrefix: string;
  getKeyUrl: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "groq",
    name: "Groq",
    free: false,
    freeNote: "Fastest inference — from $0.075/1M tokens",
    models: [
      { id: "openai/gpt-oss-20b", label: "GPT OSS 20B · 1000 T/s · $0.075/1M" },
      { id: "openai/gpt-oss-120b", label: "GPT OSS 120B · 500 T/s · $0.15/1M" },
      { id: "meta-llama/llama-4-scout-17b-16e-instruct", label: "Llama 4 Scout 17B · $0.11/1M" },
    ],
    keyPlaceholder: "gsk_...",
    keyPrefix: "gsk_",
    getKeyUrl: "https://console.groq.com/keys",
  },
  {
    id: "google",
    name: "Google Gemini",
    free: true,
    freeNote: "Free tier available — Gemini 2.5 Flash recommended",
    models: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash · GA · Free tier" },
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro · Most capable" },
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash · Stable" },
      { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite · Fastest/cheapest" },
    ],
    keyPlaceholder: "AIza...",
    keyPrefix: "AIza",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    free: true,
    freeNote: "Has free models — no credit card required",
    models: [
      { id: "meta-llama/llama-4-scout:free", label: "Llama 4 Scout (free)" },
      { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (free)" },
      { id: "qwen/qwen3-8b:free", label: "Qwen3 8B (free)" },
      { id: "qwen/qwen3-32b:free", label: "Qwen3 32B (free)" },
      { id: "google/gemma-3-27b-it:free", label: "Gemma 3 27B (free)" },
      { id: "mistralai/devstral-small:free", label: "Devstral Small — code-focused (free)" },
    ],
    keyPlaceholder: "sk-or-...",
    keyPrefix: "sk-or-",
    getKeyUrl: "https://openrouter.ai/keys",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    free: false,
    models: [
      { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 · Fastest/cheapest" },
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 · Best balance" },
      { id: "claude-opus-4-7", label: "Claude Opus 4.7 · Most capable" },
    ],
    keyPlaceholder: "sk-ant-...",
    keyPrefix: "sk-ant-",
    getKeyUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "openai",
    name: "OpenAI",
    free: false,
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o Mini · Fast/cheap" },
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "o4-mini", label: "o4-mini · Reasoning model" },
    ],
    keyPlaceholder: "sk-...",
    keyPrefix: "sk-",
    getKeyUrl: "https://platform.openai.com/api-keys",
  },
];

export interface ProviderSelection {
  providerId: ProviderID;
  model: string;
  apiKey: string;
}

export const SESSION_KEY = "pulse_review_provider";

export function saveProviderSelection(sel: ProviderSelection) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sel));
}

export function loadProviderSelection(): ProviderSelection | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProviderSelection;
  } catch {
    return null;
  }
}
