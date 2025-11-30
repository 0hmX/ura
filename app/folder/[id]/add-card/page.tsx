'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Header from '@/components/Header';
import ManualCardForm from '@/components/ManualCardForm';
import AiCardForm from '@/components/AiCardForm';
import ModeSwitcher from '@/components/ModeSwitcher';
import type { Card } from '@/types/Card';

type Mode = 'manual' | 'ai';

export default function AddCardPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getFolder, addCard } = useAppContext();
  const [mode, setMode] = useState<Mode>('ai');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const folderId = id as string;
  const folder = getFolder(folderId);

  if (!folder) {
    throw new Error(`Folder with ID "${folderId}" not found`);
  }

  const navigateBack = () => {
    router.push(`/folder/${folderId}`);
  };

  const handleManualSubmit = async (question: string, answer: string) => {
    // Negative space programming: Validate inputs early
    if (!question?.trim()) {
      const error = 'Question cannot be empty';
      setError(error);
      throw new Error(error);
    }
    if (!answer?.trim()) {
      const error = 'Answer cannot be empty';
      setError(error);
      throw new Error(error);
    }

    try {
      setError(null);
      setIsLoading(true);
      await addCard(folderId, { 
        question: question.trim(), 
        answer: answer.trim() 
      });
      navigateBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create card';
      setError(errorMessage);
      console.error('❌ AddCardPage: Manual card creation failed:', err);
      // Don't throw - let the UI handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiSubmit = async (cards: Omit<Card, 'id' | 'folder_id'>[]) => {
    // Negative space programming: Early validation
    if (!cards || cards.length === 0) {
      const error = 'No cards were generated. Please try again with different text.';
      setError(error);
      return; // Don't throw, just show error
    }

    const invalidCards = cards.filter(card => !card.question?.trim() || !card.answer?.trim());
    if (invalidCards.length > 0) {
      const error = `${invalidCards.length} of ${cards.length} generated cards are invalid. Please try again.`;
      setError(error);
      return; // Don't throw, just show error
    }

    try {
      setError(null);
      setIsLoading(true);
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        
        // Additional validation per card
        if (!card.question?.trim()) {
          throw new Error(`Card ${i + 1}: Question is empty`);
        }
        if (!card.answer?.trim()) {
          throw new Error(`Card ${i + 1}: Answer is empty`);
        }
        
        await addCard(folderId, { 
          question: card.question.trim(), 
          answer: card.answer.trim() 
        });
      }
      
      navigateBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create cards';
      setError(errorMessage);
      console.error('❌ AddCardPage: AI card creation failed:', err);
      // Don't throw - let the UI handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="font-sans text-zinc-900">
        <Header title="Add New Card" backLink={`/folder/${folderId}`}>
          <ModeSwitcher mode={mode} onModeChange={setMode} />
        </Header>
        
        <main className="p-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">
                Adding to: {folder.name}
              </h2>
              <p className="text-sm text-zinc-600">
                {mode === 'ai' ? 'Generate cards using AI' : 'Create a card manually'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {mode === 'manual' && (
              <ManualCardForm 
                onSubmit={handleManualSubmit} 
                onCancel={navigateBack}
                disabled={isLoading}
              />
            )}

            {mode === 'ai' && (
              <AiCardForm 
                onSubmit={handleAiSubmit} 
                onCancel={navigateBack}
                disabled={isLoading}
              />
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}