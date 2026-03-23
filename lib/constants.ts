/**
 * Application Constants
 */

// API Configuration
export const OLLAMA_API_BASE = 'https://api.ollama.com/api';
export const OLLAMA_GENERATE_ENDPOINT = `${OLLAMA_API_BASE}/generate`;
export const API_TIMEOUT = 60000; // 60 seconds

// Model Configuration
export const AVAILABLE_MODELS = [
  { value: 'llama2', label: 'Llama 2' },
  { value: 'llama2-uncensored', label: 'Llama 2 Uncensored' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'neural-chat', label: 'Neural Chat' },
  { value: 'dolphin-mixtral', label: 'Dolphin Mixtral' },
  { value: 'codellama', label: 'Code Llama' },
] as const;

// Generation Parameters
export const TEMPERATURE_RANGE = { min: 0, max: 2, step: 0.1 };
export const MAX_TOKENS_RANGE = { min: 128, max: 8192, step: 256 };
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 2048;

// UI Constants
export const STORAGE_KEY_SETTINGS = 'aiChatSettings';
export const TOAST_DURATION = 3000;
export const SCROLL_SMOOTH_BEHAVIOR = 'smooth' as const;

// Messages and Error Texts
export const MESSAGES = {
  WELCOME: 'Welcome to AI Chat',
  WELCOME_SUBTITLE: 'Configure your API key and model in settings to get started with intelligent conversations.',
  NO_API_KEY: 'Configure API key in settings to start chatting',
  GENERATING: 'Thinking...',
  SENDING: 'Send',
  ERROR_GENERATING: 'Error: Failed to generate response',
  ERROR_API: 'API error: {error}',
  SETTINGS_SAVED: 'Settings saved successfully',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
  OPTIMIZING_PROMPT: 'Optimize Prompt',
  COPY_OPTIMIZED: 'Copy to Clipboard',
} as const;

// Keyboard Event Keys
export const KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SHIFT: 'Shift',
} as const;

// CSS Classes
export const LAYOUT_CLASSES = {
  CONTAINER: 'flex flex-col h-full',
  FULL_HEIGHT: 'h-screen',
  FULL_WIDTH: 'w-full',
} as const;

// Animation Durations (in ms)
export const ANIMATIONS = {
  FAST: 100,
  NORMAL: 300,
  SLOW: 500,
} as const;
