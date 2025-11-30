'use client';

import { useState } from 'react';

export default function ManualCardForm({
  onSubmit,
  onCancel,
  disabled = false,
}: {
  onSubmit: (question: string, answer: string) => void | Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim() && !disabled) {
      await onSubmit(question, answer);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="w-full p-2 border border-zinc-300 rounded-lg mb-4"
        autoFocus
        disabled={disabled}
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer"
        className="w-full p-2 border border-zinc-300 rounded-lg"
        rows={4}
        disabled={disabled}
      />
      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium text-zinc-800 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={disabled || !question.trim() || !answer.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
}
