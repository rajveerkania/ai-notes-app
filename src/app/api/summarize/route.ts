import { NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SUMMARIZATION_MODEL = 'llama-3.1-8b-instant'; 
const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 10000;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || text.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text must be at least ${MIN_TEXT_LENGTH} characters long` },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: SUMMARIZATION_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Generate a concise 2-3 sentence summary of the provided text. Focus on the main ideas and key points. Be direct and factual.'
          },
          {
            role: 'user',
            content: `Text to summarize:\n\n${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      
      // Handle specific Groq API errors
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (response.status === 402) {
        return NextResponse.json(
          { error: 'Insufficient API credits. Please check your Groq account.' },
          { status: 402 }
        );
      }
      
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from API');
    }

    const summary = data.choices[0].message.content.trim();
    return NextResponse.json({ summary });
    
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    );
  }
}