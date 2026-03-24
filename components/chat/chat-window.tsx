'use client';

import { useState, useRef, useEffect } from 'react';
import { RotateCcw, Square } from 'lucide-react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { useBackendChat } from '@/hooks/use-backend-chat';
import { useGlobalShortcuts } from '@/hooks/use-global-shortcuts';
import { generateShareId, createShareUrl } from '@/lib/chat-utils';
import { Conversation } from '@/hooks/use-conversations';

interface ChatWindowProps {
  conversation?: Conversation;
  onSaveMessages?: (messages: any[]) => void;
  onUpdateTitle?: (id: string, title: string) => void;
}

export function ChatWindow({ conversation, onSaveMessages, onUpdateTitle }: ChatWindowProps) {
  const { messages, addMessage, addStreamingMessage, updateLastMessage, updateMessage, clearMessages, deleteMessage } = useChat();
  const { generateResponse, stopGeneration } = useBackendChat({
    temperature: 0.7,
    maxTokens: 2048,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const lastUserMessageRef = useRef<string>('');
  const previousConversationIdRef = useRef<string | null>(null);

  // Global keyboard shortcuts
  useGlobalShortcuts({
    focusInput: () => textareaRef.current?.focus(),
  });

  // Sync messages with conversation when it changes
  useEffect(() => {
    if (conversation && conversation.id) {
      // Only sync if we're switching to a different conversation
      if (previousConversationIdRef.current !== conversation.id) {
        previousConversationIdRef.current = conversation.id;
        
        // Clear current messages and load conversation messages
        clearMessages();
        
        // Reload messages from conversation
        conversation.messages.forEach((msg) => {
          addMessage({ role: msg.role, content: msg.content });
        });
        
        // Auto-focus input
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    }
  }, [conversation?.id]);

  // Smart auto-scroll: only scroll if user hasn't manually scrolled up
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current && !userHasScrolled) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  // Detect if user scrolled up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setUserHasScrolled(!isAtBottom);
  };

  useEffect(() => {
    // Auto-scroll when messages change
    if (!userHasScrolled) {
      scrollToBottom('smooth');
    }
  }, [messages, userHasScrolled]);

  // Save messages to conversation whenever they change
  useEffect(() => {
    if (onSaveMessages && conversation?.id && messages.length > 0) {
      // Only save if we're not in the loading/syncing phase
      // Use a timeout to debounce rapid updates
      const timer = setTimeout(() => {
        onSaveMessages(messages);

        // Auto-generate title from first user message if title is still "New Chat"
        if (conversation.title === 'New Chat') {
          const firstUserMessage = messages.find((m) => m.role === 'user');
          if (firstUserMessage) {
            const title = firstUserMessage.content.slice(0, 50);
            onUpdateTitle?.(conversation.id, title);
          }
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [messages, conversation?.id, conversation?.title, onSaveMessages, onUpdateTitle]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setUserHasScrolled(false);
      lastUserMessageRef.current = text;
      
      addMessage({ role: 'user', content: text });
      addStreamingMessage({ role: 'assistant', content: '' });

      await generateResponse(
        [...messages.map(({ id, timestamp, attachments, ...rest }) => rest), { role: 'user' as const, content: text }],
        (chunk) => {
          updateLastMessage((prev) => ({
            ...prev,
            content: (prev?.content || '') + chunk,
          }));
        },
        (err) => {
          setError(err.message);
          updateLastMessage((prev) => ({
            ...prev,
            content: `Error: ${err.message}`,
          }));
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate response';
      setError(message);
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateResponse = async () => {
    if (!lastUserMessageRef.current || messages.length < 2) {
      return;
    }

    // Remove the last assistant message
    const updatedMessages = messages.slice(0, -1);
    
    try {
      setIsLoading(true);
      setError(null);
      setUserHasScrolled(false);
      
      addStreamingMessage({ role: 'assistant', content: '' });

      await generateResponse(
        updatedMessages.map(({ id, timestamp, attachments, ...rest }) => rest),
        (chunk) => {
          updateLastMessage((prev) => ({
            ...prev,
            content: (prev?.content || '') + chunk,
          }));
        },
        (err) => {
          setError(err.message);
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to regenerate response';
      setError(message);
      console.error('Error regenerating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    // Update the message in the state
    updateMessage(messageId, newContent);
    lastUserMessageRef.current = newContent;

    // Find the index of the edited message
    const editedIndex = messages.findIndex((m) => m.id === messageId);
    if (editedIndex === -1) return;

    // Remove all messages after the edited message
    const contextMessages = messages.slice(0, editedIndex + 1);
    
    try {
      setIsLoading(true);
      setError(null);
      setUserHasScrolled(false);

      // Generate new response based on edited message
      addStreamingMessage({ role: 'assistant', content: '' });

      await generateResponse(
        contextMessages.map(({ id, timestamp, attachments, ...rest }) => rest),
        (chunk) => {
          updateLastMessage((prev) => ({
            ...prev,
            content: (prev?.content || '') + chunk,
          }));
        },
        (err) => {
          setError(err.message);
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate response';
      setError(message);
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex flex-col">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth"
          onScroll={handleScroll}
        >
          <div className="p-3 sm:p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center px-4">
                <div className="text-center space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Welcome to AI Chat
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                    Start typing to begin your conversation with the AI assistant.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className="group">
                    <MessageBubble
                      id={msg.id}
                      role={msg.role}
                      content={msg.content}
                      isEdited={msg.isEdited}
                      attachments={msg.attachments}
                      onEdit={msg.role === 'user' ? handleEditMessage : undefined}
                    />
                  </div>
                ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {error && (
        <div className="border-t border-border p-3 bg-destructive/10 text-destructive text-sm flex items-center justify-between">
          <span>{error}</span>
          {messages.length >= 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateResponse}
              disabled={isLoading}
              className="ml-2"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          )}
        </div>
      )}

      <div className="border-t border-border p-3 sm:p-4 bg-card space-y-2 sm:space-y-3">
        {isLoading && (
          <Button
            onClick={stopGeneration}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Square className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Stop Generation</span>
            <span className="sm:hidden">Stop</span>
          </Button>
        )}
        <div className="flex gap-1 sm:gap-2 items-end">
          <div className="flex-1">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              ref={textareaRef}
            />
          </div>
          {messages.length >= 2 && !isLoading && (
            <Button
              onClick={handleRegenerateResponse}
              variant="outline"
              size="sm"
              title="Regenerate last response"
              className="px-2 sm:px-3"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
