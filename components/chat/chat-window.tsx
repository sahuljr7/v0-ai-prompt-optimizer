'use client';

import { useState, useRef, useEffect } from 'react';
import { RotateCcw, Square, Download, Share2 } from 'lucide-react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { useBackendChat } from '@/hooks/use-backend-chat';
import { useGlobalShortcuts } from '@/hooks/use-global-shortcuts';
import { exportToMarkdown, downloadMarkdown, generateShareId, createShareUrl } from '@/lib/chat-utils';

export function ChatWindow() {
  const { messages, addMessage, addStreamingMessage, updateLastMessage, updateMessage } = useChat();
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

  // Global keyboard shortcuts
  useGlobalShortcuts({
    focusInput: () => textareaRef.current?.focus(),
  });

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

  const handleExportChat = () => {
    const markdown = exportToMarkdown(messages);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadMarkdown(markdown, `chat-${timestamp}.md`);
  };

  const handleShareChat = () => {
    if (shareId) {
      const url = createShareUrl(shareId);
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } else {
      const newShareId = generateShareId();
      setShareId(newShareId);
      const url = createShareUrl(newShareId);
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
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
          <div className="p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    Welcome to AI Chat
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Start typing to begin your conversation with the AI assistant.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    id={msg.id}
                    role={msg.role}
                    content={msg.content}
                    isEdited={msg.isEdited}
                    attachments={msg.attachments}
                    onEdit={msg.role === 'user' ? handleEditMessage : undefined}
                    onExport={handleExportChat}
                    onShare={handleShareChat}
                  />
                ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="border-t border-border p-3 bg-card flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportChat}
            title="Download conversation as markdown"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareChat}
            title="Generate shareable link"
          >
            <Share2 className="w-4 h-4 mr-1" />
            {shareCopied ? 'Copied!' : 'Share'}
          </Button>
        </div>
      )}

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

      <div className="border-t border-border p-4 bg-card space-y-3">
        {isLoading && (
          <Button
            onClick={stopGeneration}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Generation
          </Button>
        )}
        <div className="flex gap-2">
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
              title="Regenerate last response"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
