import type { Folder } from '../types/Folder';
import FolderItem from './FolderItem';

export default function FolderList({
  folders,
  onDelete,
}: {
  folders: Folder[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} onDelete={onDelete} />
      ))}
    </div>
  );
}
