import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isEdited?: boolean;
  timestamp?: number;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessages((prev) => [...prev, { ...message, id, timestamp: Date.now() }]);
  };

  const addStreamingMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessages((prev) => [...prev, { ...message, id, timestamp: Date.now() }]);
  };

  const updateLastMessage = (updater: (msg: Message | undefined) => Message) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = updater(newMessages[newMessages.length - 1]);
      return newMessages;
    });
  };

  const updateMessage = useCallback((messageId: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content, isEdited: true } : msg
      )
    );
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addMessage,
    addStreamingMessage,
    updateLastMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
  };
}
