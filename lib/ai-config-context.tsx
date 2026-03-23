'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS, DEFAULT_MODEL } from './constants';

export interface AIConfig {
  apiKey: string;
  temperature: number;
  maxTokens: number;
  modelName: string;
}

interface AIConfigContextType {
  config: AIConfig;
  updateConfig: (config: Partial<AIConfig>) => void;
  isConfigured: boolean;
}

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

const DEFAULT_CONFIG: AIConfig = {
  apiKey: '',
  temperature: DEFAULT_TEMPERATURE,
  maxTokens: DEFAULT_MAX_TOKENS,
  modelName: DEFAULT_MODEL,
};

const STORAGE_KEY = 'aiChatSettings';

export function AIConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
    }
    setIsLoaded(true);
  }, []);

  const updateConfig = (updates: Partial<AIConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save AI config:', error);
    }
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AIConfigContext.Provider
      value={{
        config,
        updateConfig,
        isConfigured: !!config.apiKey && !!config.modelName,
      }}
    >
      {children}
    </AIConfigContext.Provider>
  );
}

export function useAIConfig() {
  const context = useContext(AIConfigContext);
  if (!context) {
    throw new Error('useAIConfig must be used within AIConfigProvider');
  }
  return context;
}
