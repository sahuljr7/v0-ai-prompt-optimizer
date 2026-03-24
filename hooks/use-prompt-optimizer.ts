import { useCallback } from 'react';

interface OptimizeOptions {
  tone?: 'professional' | 'casual' | 'creative' | 'technical';
  style?: 'structured' | 'narrative' | 'step-by-step';
}

export function usePromptOptimizer() {
  const optimizePrompt = useCallback(
    async (
      prompt: string,
      onChunk: (chunk: string) => void,
      options: OptimizeOptions = {}
    ) => {
      try {
        const { tone = 'professional', style = 'structured' } = options;

        const response = await fetch('/api/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            tone,
            style,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to optimize prompt');
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
    []
  );

  return { optimizePrompt };
}
