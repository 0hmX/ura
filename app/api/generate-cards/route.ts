import { NextRequest, NextResponse } from 'next/server';
import type { Card } from '@/types/Card';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 API: Received card generation request');
    const { text, count } = await request.json();
    console.log('📝 API: Request data:', { textLength: text?.length, count });
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ API: Missing GEMINI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Server configuration error' },
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
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 API: Gemini response data structure:', {
      hasCandidates: !!data.candidates,
      candidatesLength: data.candidates?.length,
      hasContent: !!data.candidates?.[0]?.content,
      hasParts: !!data.candidates?.[0]?.content?.parts,
      partsLength: data.candidates?.[0]?.content?.parts?.length
    });
    
    const content = data.candidates[0].content.parts[0].text;
    console.log('🔍 API: Raw content from Gemini:', content);
    
    const cards: Card[] = JSON.parse(content);
    console.log('✅ API: Successfully parsed cards:', { count: cards.length });
    
    return NextResponse.json({ cards });
  } catch (error) {
    console.error('💥 API: Error generating cards:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate cards' },
      { status: 500 }
    );
  }
}