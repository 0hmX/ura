'use client';

import { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import ManualCardForm from './ManualCardForm';
import AiCardForm from './AiCardForm';
import type { Card } from '../types/Card';
import ModeSwitcher from './ModeSwitcher';

type Mode = 'manual' | 'ai';

export default function AddCardModal({
  folderId,
  onClose,
}: {
  folderId: string;
  onClose: () => void;
}) {
  const { addCard } = useAppContext();
  const [mode, setMode] = useState<Mode>('manual');

  const handleManualSubmit = (question: string, answer: string) => {
    addCard(folderId, { question, answer });
    onClose();
  };

  const handleAiSubmit = (cards: Omit<Card, 'id'>[]) => {
    cards.forEach((card) => addCard(folderId, card));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Card</h2>
          <ModeSwitcher mode={mode} onModeChange={setMode} />
        </div>

        {mode === 'manual' && (
          <ManualCardForm onSubmit={handleManualSubmit} onCancel={onClose} />
        )}

        {mode === 'ai' && (
          <AiCardForm onSubmit={handleAiSubmit} onCancel={onClose} />
        )}
      </div>
    </div>
  );
}