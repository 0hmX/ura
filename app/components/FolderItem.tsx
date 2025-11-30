import Link from 'next/link';
import type { Folder } from '../types/Folder';
import { Trash2 } from 'lucide-react';

export default function FolderItem({
  folder,
  onDelete,
}: {
  folder: Folder;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex flex-col justify-between">
      <Link href={`/folder/${folder.id}`}>
        <h2 className="text-xl font-bold">{folder.name}</h2>
        <p className="text-zinc-500">{folder.cards.length} cards</p>
      </Link>
      <button
        onClick={() => onDelete(folder.id)}
        className="mt-4 text-sm text-red-500 self-end"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
