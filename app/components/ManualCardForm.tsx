'use client';

import { useState } from 'react';

export default function ManualCardForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (question: string, answer: string) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      onSubmit(question, answer);
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
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer"
        className="w-full p-2 border border-zinc-300 rounded-lg"
        rows={4}
      />
      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-zinc-600 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg"
        >
          Add Card
        </button>
      </div>
    </form>
  );
}
