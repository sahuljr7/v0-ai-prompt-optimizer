/**
 * API Utility Functions
 */

import { OLLAMA_GENERATE_ENDPOINT } from './constants';

export interface GenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  temperature?: number;
  num_predict?: number;
}

export interface GenerateResponse {
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

/**
 * Stream responses from Ollama API
 */
export async function streamOllamaResponse(
  request: GenerateRequest,
  apiKey: string,
  onChunk: (chunk: string) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(OLLAMA_GENERATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
        if (!line.trim()) continue;

        try {
          const json = JSON.parse(line) as GenerateResponse;
          if (json.response) {
            onChunk(json.response);
          }
        } catch (error) {
          console.error('[v0] Failed to parse response line:', error);
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      try {
        const json = JSON.parse(buffer) as GenerateResponse;
        if (json.response) {
          onChunk(json.response);
        }
      } catch (error) {
        console.error('[v0] Failed to parse final response:', error);
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    }
    throw err;
  }
}

/**
 * Validate API configuration
 */
export function validateAPIConfig(apiKey: string, model: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!apiKey || apiKey.trim().length === 0) {
    errors.push('API key is required');
  }

  if (!model || model.trim().length === 0) {
    errors.push('Model name is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format API error message
 */
export function formatAPIError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[v0] Attempt ${attempt + 1} failed:`, lastError);

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Check if API key appears valid
 */
export function isValidAPIKey(key: string): boolean {
  return key && key.trim().length > 0;
}

/**
 * Check if model name is provided
 */
export function isValidModelName(model: string): boolean {
  return model && model.trim().length > 0;
}
