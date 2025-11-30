'use client';

import Link from 'next/link';
import { useAppContext } from '@/store/AppContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import FolderList from '@/components/FolderList';
import Header from '@/components/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  const { folders, deleteFolder, loading, error, refreshFolders } = useAppContext();

  return (
    <ErrorBoundary>
      <AuthGuard>
        <div className="font-sans text-zinc-900">
          <Header title="Flashcards" showUserMenu={true}>
            <Link
              href="/add-folder"
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              New Folder
            </Link>
          </Header>
          <main className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-600 text-sm">Loading your folders...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <p className="text-red-700 text-sm text-center mb-4">{error}</p>
                <button
                  onClick={() => refreshFolders()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <FolderList folders={folders} onDelete={deleteFolder} />
            )}
          </main>
        </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}
