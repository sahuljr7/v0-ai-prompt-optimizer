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

    const { prompt, tone = 'professional', style = 'structured' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt format' },
        { status: 400 }
      );
    }

    // Create the optimization system prompt
    const optimizationPrompt = `You are an expert prompt engineer. Your task is to optimize the following prompt to make it more effective for AI models.

Original prompt: "${prompt}"

Tone: ${tone}
Style: ${style}

Please provide an optimized version of this prompt that:
1. Is more specific and detailed
2. Includes clear context and requirements
3. Structures instructions logically
4. Removes ambiguity
5. Gets better results from AI models

Return ONLY the optimized prompt, nothing else.`;

    // Call Ollama API
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OLLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: optimizationPrompt,
        stream: true,
        temperature: 0.7,
        num_predict: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ollama API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to optimize prompt' },
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
