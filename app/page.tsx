'use client';

import { useState } from 'react';
import { useAppContext } from '@/store/AppContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import AddFolderModal from '@/components/AddFolderModal';
import FolderList from '@/components/FolderList';
import AddFolderButton from '@/components/AddFolderButton';
import Header from '@/components/Header';

export default function Home() {
  const { folders, deleteFolder } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="font-sans text-zinc-900">
        <Header title="Flashcards" />
        <main className="p-4 relative">
          <FolderList folders={folders} onDelete={deleteFolder} />
          <AddFolderButton onClick={() => setIsModalOpen(true)} />
        </main>
        {isModalOpen && <AddFolderModal onClose={() => setIsModalOpen(false)} />}
      </div>
    </AuthGuard>
  );
}
