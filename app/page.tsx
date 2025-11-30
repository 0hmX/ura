'use client';

import Link from 'next/link';
import { useAppContext } from '@/store/AppContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import FolderList from '@/components/FolderList';
import Header from '@/components/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  const { folders, deleteFolder } = useAppContext();

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
            <FolderList folders={folders} onDelete={deleteFolder} />
          </main>
        </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}
