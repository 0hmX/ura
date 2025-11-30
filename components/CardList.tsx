import type { Card } from '@/types/Card';
import type { Folder } from '@/types/Folder';
import CardItem from './CardItem';

export default function CardList({
  folder,
  onDelete,
}: {
  folder: Folder;
  onDelete: (folderId: string, cardId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {folder.cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          folderId={folder.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
