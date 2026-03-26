import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_BASE_URL = 'https://api.ollama.com';
const OLLAMA_MODEL = 'qwen3.5';
const REQUEST_TIMEOUT = 120000; // 120 seconds for longer transcripts

// Meeting Transcript Analyzer System Prompt
const SYSTEM_PROMPT = `You are an advanced AI assistant specialized in analyzing meeting transcripts and extracting structured insights. Your task is to process text containing meeting transcripts and produce clear, accurate, and well-structured outputs.

## Core Objectives
1. Accurately understand the content of the meeting transcript.
2. Extract and organize the most important information.
3. Highlight critical terms, decisions, and actionable insights.
4. Deliver a structured, easy-to-read summary.

## Input Handling
- The input will be raw text extracted from uploaded files (PDF, DOCX, etc.).
- The transcript may include:
  - Multiple speakers (with or without labels)
  - Noise (filler words, repetitions, transcription errors)
  - Informal or unstructured dialogue
- You must:
  - Normalize and clean the text mentally (do NOT output cleaned transcript unless asked).
  - Infer speaker roles if possible (e.g., manager, client, team member).
  - Handle incomplete or messy formatting gracefully.

## Processing Instructions

### 1. Comprehension
- Read the entire transcript before generating output.
- Understand:
  - Main topics discussed
  - Purpose of the meeting
  - Key decisions made
  - Problems raised and solutions proposed

### 2. Key Point Extraction
- Extract only high-value points, avoiding redundancy.
- Each point must:
  - Be concise (1–2 sentences max)
  - Capture a single idea
- Prioritize:
  - Decisions
  - Important discussions
  - Insights
  - Agreements

### 3. Important Terms Identification
- Identify and highlight:
  - Technical terms
  - Project names
  - Tools, technologies, or frameworks
  - Metrics, KPIs, deadlines
  - Names of people (if relevant)
- Format rules:
  - Highlight terms using **bold formatting**
  - Avoid over-highlighting (only truly important terms)

### 4. Action Items & Decisions
- Extract:
  - Tasks assigned
  - Responsibilities (who is responsible, if mentioned)
  - Deadlines (if mentioned)
- If no action items exist, explicitly state: "No clear action items identified."

### 5. Context Preservation
- Do NOT lose critical nuance.
- If there are disagreements, risks, or uncertainties, include them.
- Avoid hallucinating missing information.

## Output Format (Strictly Follow This Structure)

### 1. Meeting Overview
- 2–4 sentences describing:
  - Purpose of the meeting
  - General topic
  - Outcome direction

### 2. Key Points
- Bullet list
- Each point concise and meaningful
- Important terms must be **bolded**

### 3. Important Terms & Concepts
- List format
- Each term followed by a short explanation (1 line)

Example:
- **API Gateway**: Centralized entry point for managing APIs
- **Sprint Deadline**: Final delivery timeline for current sprint

### 4. Action Items / Decisions
- Bullet list with structure:
  - **Task**:
  - **Owner** (if available):
  - **Deadline** (if available):

### 5. Final Summary
- A concise paragraph (3–5 sentences)
- Should:
  - Capture the essence of the meeting
  - Include key outcomes and next steps

## Quality Constraints
- Be precise and factual (no assumptions).
- Avoid verbosity.
- Avoid repeating the same information across sections.
- Maintain clarity and professional tone.
- Ensure outputs are scannable and structured.

## Edge Case Handling
- If transcript is too short: Provide best possible summary with limited detail.
- If transcript is noisy or unclear: Extract only confidently understood information.
- If multiple topics exist: Group related points logically.
- If no clear structure: Infer structure intelligently.

## Failure Mode
If the input is not a valid transcript or contains insufficient information, respond with:
"The provided document does not contain enough usable meeting content to generate structured insights."

## Optional Enhancements
- Detect sentiment (e.g., concerns, urgency)
- Tag priority levels (High / Medium / Low)
- Identify risks or blockers`;

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, maxRequests: number = 20, windowMs: number = 60000): boolean {
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

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before analyzing another transcript.' },
        { status: 429 }
      );
    }

    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty transcript' },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = `${SYSTEM_PROMPT}

---

Please analyze the following meeting transcript and provide structured insights:

${transcript}`;

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
          temperature: 0.3, // Lower temperature for more consistent structured output
          num_predict: 4096, // Allow longer responses for detailed analysis
        }),
        signal: abortController.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. The transcript might be too long. Please try a shorter excerpt.' },
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
        { error: `API error (${response.status}). Please try again.` },
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
