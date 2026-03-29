'use client';

import { useState, useCallback, useEffect } from 'react';

export interface Session<T> {
  id: string;
  title: string;
  data: T;
  createdAt: number;
  updatedAt: number;
}

interface UseSessionsOptions {
  storageKey: string;
}

export function useSessions<T>(options: UseSessionsOptions) {
  const { storageKey } = options;
  const [sessions, setSessions] = useState<Session<T>[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setSessions(JSON.parse(saved));
      }
    } catch (e) {
      console.error(`Failed to load sessions from ${storageKey}:`, e);
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(sessions));
      } catch (e) {
        console.error(`Failed to save sessions to ${storageKey}:`, e);
      }
    }
  }, [sessions, isLoaded, storageKey]);

  const createSession = useCallback(
    (initialData: T, title: string = 'New Session') => {
      const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newSession: Session<T> = {
        id,
        title,
        data: initialData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(id);
      return id;
    },
    []
  );

  const getActiveSession = useCallback(() => {
    return sessions.find((s) => s.id === activeSessionId);
  }, [sessions, activeSessionId]);

  const updateSessionData = useCallback(
    (sessionId: string, data: T) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, data, updatedAt: Date.now() }
            : s
        )
      );
    },
    []
  );

  const updateActiveSessionData = useCallback(
    (data: T) => {
      if (activeSessionId) {
        updateSessionData(activeSessionId, data);
      }
    },
    [activeSessionId, updateSessionData]
  );

  const updateSessionTitle = useCallback(
    (sessionId: string, newTitle: string) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, title: newTitle, updatedAt: Date.now() }
            : s
        )
      );
    },
    []
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          setActiveSessionId(null);
        }
      }
    },
    [activeSessionId, sessions]
  );

  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
  }, []);

  return {
    sessions,
    activeSessionId,
    isLoaded,
    createSession,
    getActiveSession,
    updateSessionData,
    updateActiveSessionData,
    updateSessionTitle,
    deleteSession,
    switchSession,
    clearAllSessions,
  };
}
