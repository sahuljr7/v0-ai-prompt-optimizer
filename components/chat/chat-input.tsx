'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  ref?: React.RefObject<HTMLTextAreaElement>;
}

export const ChatInput = ({ onSend, isLoading, ref: externalRef }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = externalRef || useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    // Clear message with Escape
    if (e.key === 'Escape' && input.trim()) {
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Shift+Enter for new line, Esc to clear)"
        disabled={isLoading}
        className="flex-1 bg-input border-border resize-none min-h-12 max-h-48"
        rows={1}
      />
      <Button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="gap-2 h-12"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">Thinking...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </>
        )}
      </Button>
    </form>
  );
};
