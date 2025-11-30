import type { Card } from '../types/Card';
import { Trash2 } from 'lucide-react';

export default function CardItem({
  card,
  folderId,
  onDelete,
}: {
  card: Card;
  folderId: string;
  onDelete: (folderId: string, cardId: string) => void;
}) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <p className="font-bold">{card.question}</p>
      <p>{card.answer}</p>
      <button
        onClick={() => onDelete(folderId, card.id)}
        className="mt-4 text-sm text-red-500 self-end"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
