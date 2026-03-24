import { useState, useCallback, useEffect } from 'react';
import { Message } from './use-chat';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'conversations';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConversations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations, isLoaded]);

  const createConversation = useCallback(() => {
    const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newConversation: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(id);
    return id;
  }, []);

  const getActiveConversation = useCallback(() => {
    return conversations.find((c) => c.id === activeConversationId);
  }, [conversations, activeConversationId]);

  const updateConversationMessages = useCallback(
    (messages: Message[]) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages, updatedAt: Date.now() }
            : c
        )
      );
    },
    [activeConversationId]
  );

  const updateConversationTitle = useCallback(
    (conversationId: string, newTitle: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, title: newTitle, updatedAt: Date.now() }
            : c
        )
      );
    },
    []
  );

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      const remaining = conversations.filter((c) => c.id !== conversationId);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        setActiveConversationId(null);
      }
    }
  }, [activeConversationId, conversations]);

  const switchConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  return {
    conversations,
    activeConversationId,
    isLoaded,
    createConversation,
    getActiveConversation,
    updateConversationMessages,
    updateConversationTitle,
    deleteConversation,
    switchConversation,
  };
}
