import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_BASE_URL = 'https://api.ollama.com';
const OLLAMA_MODEL = 'qwen3.5';
const REQUEST_TIMEOUT = 60000; // 60 seconds

// Simple in-memory rate limiter (consider using Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!OLLAMA_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured on server' },
        { status: 500 }
      );
    }

    // Rate limiting - use IP address as client ID
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    const { messages, temperature = 0.7, maxTokens = 2048 } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty messages format' },
        { status: 400 }
      );
    }

    if (temperature < 0 || temperature > 2) {
      return NextResponse.json(
        { error: 'Temperature must be between 0 and 2' },
        { status: 400 }
      );
    }

    if (maxTokens < 1 || maxTokens > 8192) {
      return NextResponse.json(
        { error: 'Max tokens must be between 1 and 8192' },
        { status: 400 }
      );
    }

    // Build the prompt from messages
    const prompt = messages
      .map((msg: { role: string; content: string }) => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else {
          return `Assistant: ${msg.content}`;
        }
      })
      .join('\n\n');

    // Create abort controller with timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT);

    // Call Ollama API
    let response;
    try {
      response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OLLAMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: true,
          temperature: temperature,
          num_predict: maxTokens,
        }),
        signal: abortController.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 504 }
        );
      }
      throw error;
    }

    if (!response.ok) {
      clearTimeout(timeoutId);
      const errorData = await response.text();
      console.error('Ollama API error:', errorData);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Model not found. Please check your Ollama configuration.' },
          { status: 400 }
        );
      }
      
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: 'Authentication failed. Please check your API key.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Ollama API error (${response.status}). Please try again.` },
        { status: response.status }
      );
    }

    // Stream the response
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: 'Failed to read response stream' },
        { status: 500 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const json = JSON.parse(line);
                  if (json.response) {
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${JSON.stringify({ content: json.response })}\n\n`)
                    );
                  }
                } catch (e) {
                  console.error('Failed to parse JSON:', e);
                }
              }
            }
          }

          // Handle remaining buffer
          if (buffer.trim()) {
            try {
              const json = JSON.parse(buffer);
              if (json.response) {
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ content: json.response })}\n\n`)
                );
              }
            } catch (e) {
              console.error('Failed to parse final JSON:', e);
            }
          }

          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          clearTimeout(timeoutId);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
