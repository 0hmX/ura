import type { Folder } from '@/types/Folder';
import FolderItem from './FolderItem';

export default function FolderList({
  folders,
  onDelete,
}: {
  folders: Folder[];
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} onDelete={onDelete} />
      ))}
    </div>
  );
}
