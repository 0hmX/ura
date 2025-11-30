import type { Card } from '@/types/Card';

export async function generateCards(
  text: string,
  count: number,
  apiKey: string
): Promise<Card[]> {
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

  if (!response.ok) {
    throw new Error('Failed to generate cards');
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  return JSON.parse(content);
}