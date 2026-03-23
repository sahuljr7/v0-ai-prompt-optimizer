import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_BASE_URL = 'https://api.ollama.com';
const OLLAMA_MODEL = 'qwen3.5';

export async function POST(request: NextRequest) {
  try {
    if (!OLLAMA_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured on server' },
        { status: 500 }
      );
    }

    const { messages, temperature = 0.7, maxTokens = 2048 } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
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

    // Call Ollama API
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
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
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ollama API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate response from Ollama' },
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
