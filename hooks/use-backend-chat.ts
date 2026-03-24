import { useCallback, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseBackendChatOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export function useBackendChat(options: UseBackendChatOptions = {}) {
  const { temperature = 0.7, maxTokens = 2048, timeout = 30000 } = options;
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateResponse = useCallback(
    async (
      messages: Message[],
      onChunk: (chunk: string) => void,
      onError?: (error: Error) => void
    ) => {
      try {
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), timeout);

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
          signal: abortControllerRef.current.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `HTTP ${response.status}: Failed to generate response`);
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
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        const err = new Error(message);
        if (onError) {
          onError(err);
        } else {
          throw err;
        }
      }
    },
    [temperature, maxTokens, timeout]
  );

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return { generateResponse, stopGeneration };
}
