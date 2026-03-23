import { useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseBackendChatOptions {
  temperature?: number;
  maxTokens?: number;
}

export function useBackendChat(options: UseBackendChatOptions = {}) {
  const { temperature = 0.7, maxTokens = 2048 } = options;

  const generateResponse = useCallback(
    async (
      messages: Message[],
      onChunk: (chunk: string) => void
    ) => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            temperature,
            maxTokens,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to generate response');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to read response stream');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                return;
              }
              try {
                const json = JSON.parse(data);
                if (json.content) {
                  onChunk(json.content);
                }
              } catch (e) {
                console.error('Failed to parse chunk:', e);
              }
            }
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(message);
      }
    },
    [temperature, maxTokens]
  );

  return { generateResponse };
}
