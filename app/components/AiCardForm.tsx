'use client';

import { useState } from 'react';
import { generateCards } from '../utils/gemini';
import type { Card } from '../types/Card';

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
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiText.trim() && apiKey.trim()) {
      setIsLoading(true);
      try {
        const cards = await generateCards(aiText, cardCount, apiKey);
        onSubmit(cards);
      } catch (error) {
        console.error(error);
        alert('Failed to generate cards. Please check your API key and try again.');
      } finally {
        setIsLoading(false);
      }
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
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Gemini API Key"
        className="w-full p-2 border border-zinc-300 rounded-lg mb-4"
      />
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
