'use client';

import { useState } from 'react';
import { useAppContext } from './store/AppContext';
import AddFolderModal from './components/AddFolderModal';
import PageHeader from './components/PageHeader';
import FolderList from './components/FolderList';
import AddFolderButton from './components/AddFolderButton';

export default function Home() {
  const { folders, deleteFolder } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-sans text-zinc-900">
      <PageHeader title="Flashcards" />
      <main className="p-4 relative">
        <FolderList folders={folders} onDelete={deleteFolder} />
        <AddFolderButton onClick={() => setIsModalOpen(true)} />
      </main>
      {isModalOpen && <AddFolderModal onClose={() => setIsModalOpen(false)} />}
      {isModalOpen && <AddFolderModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
