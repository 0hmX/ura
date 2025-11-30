'use client';

import { useState } from 'react';
import type { Card } from '@/types/Card';

export default function AiCardForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (cards: Omit<Card, 'id'>[]) => void;
  onCancel: () => void;
}) {
  const [aiText, setAiText] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiText.trim()) {
      console.log('🎯 Client: Starting card generation...', { textLength: aiText.length, count: cardCount });
      setIsLoading(true);
      try {
        console.log('📤 Client: Sending request to /api/generate-cards');
        const response = await fetch('/api/generate-cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: aiText,
            count: cardCount,
          }),
        });

        console.log('📥 Client: Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Client: API error response:', errorData);
          throw new Error(errorData.error || 'Failed to generate cards');
        }

        const data = await response.json();
        console.log('✅ Client: Received cards:', { count: data.cards?.length });
        console.log('📋 Client: Cards data:', data.cards);
        
        onSubmit(data.cards);
      } catch (error) {
        console.error('💥 Client: Error during card generation:', error);
        alert(`Failed to generate cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.warn('⚠️ Client: No text provided for card generation');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={aiText}
        onChange={(e) => setAiText(e.target.value)}
        placeholder="Paste your text here..."
        className="w-full p-2 border border-zinc-300 rounded-lg"
        rows={8}
      />
      <div className="flex items-center gap-4 my-4">
        <label htmlFor="cardCount" className="text-sm">
          Number of cards:
        </label>
        <input
          type="number"
          id="cardCount"
          value={cardCount}
          onChange={(e) => setCardCount(parseInt(e.target.value))}
          className="w-20 p-2 border border-zinc-300 rounded-lg"
          min="1"
          max="20"
        />
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-zinc-800 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Cards'}
        </button>
      </div>
    </form>
  );
}
