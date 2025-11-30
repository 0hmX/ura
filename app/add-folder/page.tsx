'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/AppContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Header from '@/components/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AddFolderPage() {
  const router = useRouter();
  const { addFolder } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigateBack = () => {
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Negative space programming: Early validation
    if (!name?.trim()) {
      const error = 'Folder name is required';
      setError(error);
      return;
    }

    if (name.trim().length < 2) {
      const error = 'Folder name must be at least 2 characters long';
      setError(error);
      return;
    }

    if (name.trim().length > 50) {
      const error = 'Folder name must be 50 characters or less';
      setError(error);
      return;
    }

    if (description && description.trim().length > 200) {
      const error = 'Description must be 200 characters or less';
      setError(error);
      return;
    }

    // Validate for potentially problematic characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name.trim())) {
      const error = 'Folder name contains invalid characters';
      setError(error);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      await addFolder(name.trim(), description.trim() || undefined);
      navigateBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create folder';
      setError(errorMessage);
      console.error('❌ AddFolderPage: Folder creation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <AuthGuard>
        <div className="font-sans text-zinc-900">
          <Header title="Add New Folder" backLink="/" />
          
          <main className="p-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 mb-1">
                  Create a new flashcard folder
                </h2>
                <p className="text-sm text-zinc-600">
                  Folders help you organize your flashcards by topic or subject
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
                    Folder Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Spanish Vocabulary, Biology Chapter 1"
                    className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    disabled={isLoading}
                    autoFocus
                    maxLength={50}
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    {name.length}/50 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description to help you remember what this folder is for..."
                    className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    rows={3}
                    disabled={isLoading}
                    maxLength={200}
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    {description.length}/200 characters
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={navigateBack}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Create Folder'}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}