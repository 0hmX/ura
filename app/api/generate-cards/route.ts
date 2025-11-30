import { NextRequest, NextResponse } from 'next/server';
import type { Card } from '@/types/Card';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 API: Received card generation request');
    
    // Negative space programming: Validate inputs early
    const requestData = await request.json();
    const { text, count } = requestData;
    
    if (!text?.trim()) {
      return NextResponse.json(
        { error: 'Text is required for card generation' },
        { status: 400 }
      );
    }
    
    if (!count || count < 1 || count > 20) {
      return NextResponse.json(
        { error: 'Card count must be between 1 and 20' },
        { status: 400 }
      );
    }
    
    if (text.length < 10) {
      return NextResponse.json(
        { error: 'Text must be at least 10 characters long' },
        { status: 400 }
      );
    }
    
    if (text.length > 50000) {
      return NextResponse.json(
        { error: 'Text is too long (maximum 50,000 characters)' },
        { status: 400 }
      );
    }
    
    console.log('📝 API: Request data validated:', { textLength: text.length, count });
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ API: Missing GEMINI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'AI service not configured. Please contact support.' },
        { status: 500 }
      );
    }
    
    console.log('🔑 API: API key found, proceeding with Gemini request');

    const prompt = `
      Given the following text, generate ${count} flashcards with a question and answer.
      The output should be a JSON array of objects, where each object has "question" and "answer" keys.
      Example:
      [
        {
          "question": "What is the capital of France?",
          "answer": "Paris"
        },
        {
          "question": "What is the highest mountain in the world?",
          "answer": "Mount Everest"
        }
      ]
      Text: ${text}
    `;

    console.log('🚀 API: Making request to Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' },
                },
                required: ['question', 'answer'],
              },
            },
          },
        }),
      }
    );

    console.log('📡 API: Gemini response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API: Gemini API error:', response.status, errorText);
      
      // Map common API errors to user-friendly messages
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'AI service authentication failed. Please contact support.' },
          { status: 500 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'AI service is busy. Please try again in a moment.' },
          { status: 429 }
        );
      }
      if (response.status >= 500) {
        return NextResponse.json(
          { error: 'AI service is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      
      throw new Error(`AI service error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 API: Gemini response data structure:', {
      hasCandidates: !!data.candidates,
      candidatesLength: data.candidates?.length,
      hasContent: !!data.candidates?.[0]?.content,
      hasParts: !!data.candidates?.[0]?.content?.parts,
      partsLength: data.candidates?.[0]?.content?.parts?.length
    });
    
    // Negative space programming: Validate AI response structure
    if (!data.candidates?.length) {
      throw new Error('AI service returned no candidates');
    }
    
    const candidate = data.candidates[0];
    if (!candidate.content?.parts?.length) {
      throw new Error('AI service returned malformed response');
    }
    
    const content = candidate.content.parts[0].text;
    if (!content?.trim()) {
      throw new Error('AI service returned empty content');
    }
    
    console.log('🔍 API: Raw content from Gemini:', content);
    
    let cards: Card[];
    try {
      cards = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ API: Failed to parse AI response as JSON:', parseError);
      throw new Error('AI service returned invalid format');
    }
    
    // Validate generated cards
    if (!Array.isArray(cards)) {
      throw new Error('AI service did not return cards in expected format');
    }
    
    if (cards.length === 0) {
      throw new Error('AI service generated no cards');
    }
    
    const invalidCards = cards.filter(card => 
      !card.question?.trim() || !card.answer?.trim()
    );
    
    if (invalidCards.length > 0) {
      throw new Error(`AI service generated ${invalidCards.length} invalid card(s)`);
    }
    
    console.log('✅ API: Successfully validated cards:', { count: cards.length });
    
    return NextResponse.json({ cards });
  } catch (error) {
    console.error('💥 API: Error generating cards:', error);
    
    // Don't expose internal errors to client
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate cards';
    const isClientError = errorMessage.includes('Text is required') || 
                         errorMessage.includes('Card count must be') ||
                         errorMessage.includes('Text must be at least') ||
                         errorMessage.includes('Text is too long');
    
    return NextResponse.json(
      { error: errorMessage },
      { status: isClientError ? 400 : 500 }
    );
  }
}