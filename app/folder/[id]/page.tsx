'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/store/AppContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import AddCardModal from '@/components/AddCardModal';
import CardList from '@/components/CardList';
import StudyButton from '@/components/StudyButton';
import AddCardButton from '@/components/AddCardButton';
import Header from '@/components/Header';

export default function FolderPage() {
  const { id } = useParams();
  const { getFolder, deleteCard } = useAppContext();
  const folder = getFolder(id as string);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!folder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Folder not found.</p>
        <Link href="/" className="text-blue-500">
          Go back to homepage
        </Link>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="font-sans text-zinc-900">
        <Header title={folder.name} backLink="/">
          <div className="flex gap-2">
            <StudyButton folderId={folder.id} />
            <AddCardButton onClick={() => setIsModalOpen(true)} />
          </div>
        </Header>
        <main className="p-4 relative">
          <CardList folder={folder} onDelete={deleteCard} />
        </main>
        {isModalOpen && (
          <AddCardModal
            folderId={folder.id}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </AuthGuard>
  );
}