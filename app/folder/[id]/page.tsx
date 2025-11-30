'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '../../store/AppContext';
import AddCardModal from '../../components/AddCardModal';
import CardList from '../../components/CardList';
import StudyButton from '../../components/StudyButton';
import AddCardButton from '../../components/AddCardButton';

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
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <header className="flex items-center justify-between p-4 border-b border-zinc-200">
        <Link href="/" className="text-xl font-bold">
          &larr; {folder.name}
        </Link>
        <div className="flex gap-2">
          <StudyButton folderId={folder.id} />
          <AddCardButton onClick={() => setIsModalOpen(true)} />
        </div>
      </header>
      <main className="p-4">
        <CardList folder={folder} onDelete={deleteCard} />
      </main>
      {isModalOpen && (
        <AddCardModal
          folderId={folder.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}