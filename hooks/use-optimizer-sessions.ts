'use client';

import { useSessions, Session } from './use-sessions';

export interface OptimizerSessionData {
  prompt: string;
  optimized: string;
  tone: 'professional' | 'casual' | 'creative' | 'technical';
  style: 'structured' | 'narrative' | 'step-by-step';
  isLoading: boolean;
}

const OPTIMIZER_STORAGE_KEY = 'optimizer-sessions';

export function useOptimizerSessions() {
  const sessions = useSessions<OptimizerSessionData>({
    storageKey: OPTIMIZER_STORAGE_KEY,
  });

  const createOptimizationSession = (initialPrompt: string = '') => {
    return sessions.createSession(
      {
        prompt: initialPrompt,
        optimized: '',
        tone: 'professional',
        style: 'structured',
        isLoading: false,
      },
      'New Optimization'
    );
  };

  const getActiveSession = (): Session<OptimizerSessionData> | undefined => {
    return sessions.getActiveSession();
  };

  const updateSessionPrompt = (prompt: string) => {
    if (sessions.activeSessionId) {
      const activeSession = sessions.getActiveSession();
      if (activeSession) {
        sessions.updateSessionData(sessions.activeSessionId, {
          ...activeSession.data,
          prompt,
        });
      }
    }
  };

  const updateSessionOptimized = (optimized: string) => {
    if (sessions.activeSessionId) {
      const activeSession = sessions.getActiveSession();
      if (activeSession) {
        sessions.updateSessionData(sessions.activeSessionId, {
          ...activeSession.data,
          optimized,
        });
      }
    }
  };

  const updateSessionOptions = (tone: string, style: string) => {
    if (sessions.activeSessionId) {
      const activeSession = sessions.getActiveSession();
      if (activeSession) {
        sessions.updateSessionData(sessions.activeSessionId, {
          ...activeSession.data,
          tone: tone as OptimizerSessionData['tone'],
          style: style as OptimizerSessionData['style'],
        });
      }
    }
  };

  const updateSessionLoading = (isLoading: boolean) => {
    if (sessions.activeSessionId) {
      const activeSession = sessions.getActiveSession();
      if (activeSession) {
        sessions.updateSessionData(sessions.activeSessionId, {
          ...activeSession.data,
          isLoading,
        });
      }
    }
  };

  return {
    ...sessions,
    createOptimizationSession,
    getActiveSession,
    updateSessionPrompt,
    updateSessionOptimized,
    updateSessionOptions,
    updateSessionLoading,
  };
}
