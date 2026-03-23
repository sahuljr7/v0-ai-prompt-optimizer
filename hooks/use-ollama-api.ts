import { useState } from 'react';

interface UseOllamaAPIProps {
  apiKey: string;
  temperature: number;
  maxTokens: number;
  modelName: string;
}

export function useOllamaAPI({
  apiKey,
  temperature,
  maxTokens,
  modelName,
}: UseOllamaAPIProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (
    prompt: string,
    onChunk: (chunk: string) => void,
    retries = 3
  ) => {
    setIsLoading(true);
    setError(null);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch('https://api.ollama.com/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            prompt,
            stream: true,
            temperature,
            num_predict: maxTokens,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
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

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const json = JSON.parse(line);
              if (json.response) {
                onChunk(json.response);
              }
            } catch (e) {
              // Ignore JSON parse errors for non-JSON lines
              console.error('[v0] Parse error:', e);
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer);
            if (json.response) {
              onChunk(json.response);
            }
          } catch (e) {
            console.error('[v0] Final parse error:', e);
          }
        }

        setIsLoading(false);
        return; // Success, exit retry loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`[v0] Attempt ${attempt + 1} failed:`, lastError);

        // Wait before retrying (exponential backoff)
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // All retries failed
    setIsLoading(false);
    setError(lastError?.message || 'Failed to generate response');
    throw lastError || new Error('Failed to generate response after retries');
  };

  return {
    generateResponse,
    isLoading,
    error,
  };
}
