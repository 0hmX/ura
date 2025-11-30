'use client';

import { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import type { Card } from '@/types/Card';
import ManualCardForm from './ManualCardForm';
import AiCardForm from './AiCardForm';
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
  const [mode, setMode] = useState<Mode>('ai');

  const handleManualSubmit = (question: string, answer: string) => {
    addCard(folderId, { question, answer });
    onClose();
  };

  const handleAiSubmit = async (cards: Omit<Card, 'id' | 'folder_id'>[]) => {
    console.log('🎴 AddCardModal: Received AI generated cards:', { count: cards.length });
    console.log('📝 AddCardModal: Cards content:', cards);
    
    try {
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        console.log(`🃏 AddCardModal: Adding card ${i + 1}:`, card);
        await addCard(folderId, card);
        console.log(`✅ AddCardModal: Card ${i + 1} added successfully`);
      }
      console.log('✅ AddCardModal: All cards added successfully, closing modal');
      
      // Force refresh folders to ensure UI is updated
      console.log('🔄 AddCardModal: Refreshing folders to ensure UI update');
      // We'll need to get this from context if needed
      
      onClose();
    } catch (error) {
      console.error('❌ AddCardModal: Error adding cards:', error);
      alert(`Failed to add cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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