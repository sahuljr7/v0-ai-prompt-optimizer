import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_BASE_URL = 'https://api.ollama.com';
const OLLAMA_MODEL = 'qwen3.5';

const TRANSCRIPT_ANALYSIS_PROMPT = `You are an expert meeting transcript analyzer. Analyze the provided meeting transcript and extract structured insights following this EXACT format:

## MEETING OVERVIEW
[2-4 sentences describing the purpose, general topic, and outcome direction]

## KEY POINTS
[Bullet list with concise, meaningful points. Bold important terms using **term**]

## IMPORTANT TERMS & CONCEPTS
[List format with term followed by explanation on same line]

## ACTION ITEMS / DECISIONS
[Bullet list with structure: **Task**: [description], **Owner** (if available): [name], **Deadline** (if available): [date]]

## FINAL SUMMARY
[3-5 sentence paragraph capturing essence, outcomes, and next steps]

Rules:
- Be precise and factual (no assumptions)
- Avoid verbosity
- Avoid repeating information across sections
- Maintain professional tone
- Ensure outputs are scannable and structured
- Bold only truly important terms (not everything)
- If no action items exist, state "No clear action items identified."

Transcript to analyze:`;

export async function POST(request: NextRequest) {
  try {
    if (!OLLAMA_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured on server' },
        { status: 500 }
      );
    }

    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty transcript provided' },
        { status: 400 }
      );
    }

    // Check if transcript has minimum content
    const words = transcript.trim().split(/\s+/).length;
    if (words < 20) {
      return NextResponse.json(
        { error: 'Transcript is too short. Provide at least 20 words.' },
        { status: 400 }
      );
    }

    // Create abort controller with timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 60000);

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
          prompt: `${TRANSCRIPT_ANALYSIS_PROMPT}\n\n${transcript}`,
          stream: false,
          temperature: 0.7,
          num_predict: 2000,
        }),
        signal: abortController.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. Transcript too large or server slow.' },
          { status: 504 }
        );
      }
      throw error;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ollama API error:', errorData);

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: 'Authentication failed. Check your API key.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Analysis failed (${response.status}). Please try again.` },
        { status: response.status }
      );
    }

    const result = await response.json();
    const analysis = result.response || '';

    if (!analysis.trim()) {
      return NextResponse.json(
        { error: 'No analysis generated. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: analysis.trim(),
    });
  } catch (error) {
    console.error('Transcript analysis error:', error);
    return NextResponse.json(
      { error: 'Server error during analysis. Please try again.' },
      { status: 500 }
    );
  }
}
