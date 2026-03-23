'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { useChat } from '@/hooks/use-chat';
import { useOllamaAPI } from '@/hooks/use-ollama-api';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatWindowProps {
  apiKey: string;
  temperature: number;
  maxTokens: number;
  modelName: string;
}

export function ChatWindow({
  apiKey,
  temperature,
  maxTokens,
  modelName,
}: ChatWindowProps) {
  const { messages, addMessage, addStreamingMessage, updateLastMessage } = useChat();
  const { generateResponse } = useOllamaAPI({
    apiKey,
    temperature,
    maxTokens,
    modelName,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !apiKey || !modelName) {
      return;
    }

    try {
      setIsLoading(true);
      addMessage({ role: 'user', content: text });
      addStreamingMessage({ role: 'assistant', content: '' });

      await generateResponse(
        text,
        (chunk) => {
          updateLastMessage((prev) => ({
            ...prev,
            content: (prev?.content || '') + chunk,
          }));
        }
      );
    } catch (error) {
      console.error('Error generating response:', error);
      updateLastMessage((prev) => ({
        ...prev,
        content: (prev?.content || '') + '\n\n[Error: Failed to generate response]',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    Welcome to AI Chat
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Configure your API key and model in settings to get started with intelligent conversations.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <MessageBubble key={idx} role={msg.role} content={msg.content} />
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border p-4 bg-card">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          disabled={!apiKey || !modelName}
        />
      </div>
    </div>
  );
}
