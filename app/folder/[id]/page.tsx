'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/store/AppContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import CardList from '@/components/CardList';
import StudyButton from '@/components/StudyButton';
import Header from '@/components/Header';

export default function FolderPage() {
  const { id } = useParams();
  const { getFolder, deleteCard } = useAppContext();
  const folder = getFolder(id as string);

  if (!folder) {
    throw new Error(`Folder with ID "${id}" not found`);
  }

  return (
    <AuthGuard>
      <div className="font-sans text-zinc-900">
        <Header title={folder.name} backLink="/">
          <div className="flex gap-2">
            <Link
              href={`/folder/${folder.id}/add-card`}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Add Card
            </Link>
            <StudyButton folderId={folder.id} />
          </div>
        </Header>
        <main className="p-4 relative">
          <CardList folder={folder} onDelete={deleteCard} />
        </main>
      </div>
    </AuthGuard>
  );
}