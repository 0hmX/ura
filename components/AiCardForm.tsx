'use client';

import { useState } from 'react';
import type { Card } from '@/types/Card';

export default function AiCardForm({
  onSubmit,
  onCancel,
  disabled = false,
}: {
  onSubmit: (cards: Omit<Card, 'id' | 'folder_id'>[]) => void | Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const [aiText, setAiText] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiText.trim() && !disabled && !isLoading) {
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
        
        await onSubmit(data.cards);
      } catch (error) {
        console.error('💥 Client: Error during card generation:', error);
        throw error; // Let parent handle the error display
      } finally {
        setIsLoading(false);
      }
    } else if (!aiText.trim()) {
      throw new Error('Please enter some text to generate cards');
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
        disabled={disabled || isLoading}
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
          disabled={disabled || isLoading}
        />
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled || isLoading}
          className="px-4 py-2 text-sm font-medium text-zinc-800 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={disabled || isLoading || !aiText.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : disabled ? 'Adding...' : 'Generate Cards'}
        </button>
      </div>
    </form>
  );
}
