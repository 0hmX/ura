'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Folder } from '@/types/Folder';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

export default function FolderItem({
  folder,
  onDelete,
}: {
  folder: Folder;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const cardCount = folder.cards?.length || 0;

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(folder.id);
      setShowConfirm(false);
    } catch (error) {
      console.error('❌ FolderItem: Delete failed:', error);
      // Keep dialog open if deletion fails so user can try again
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="p-4 bg-white rounded-lg shadow-sm border border-zinc-200 flex justify-between items-center hover:shadow-md transition-shadow">
        <Link href={`/folder/${folder.id}`} className="flex-1 min-w-0">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 truncate">
              {folder.name}
            </h2>
            {folder.description && (
              <p className="text-sm text-zinc-600 truncate mt-1">
                {folder.description}
              </p>
            )}
            <p className="text-sm text-zinc-500 mt-1">
              {cardCount} {cardCount === 1 ? 'card' : 'cards'}
            </p>
          </div>
        </Link>
        
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="ml-3 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Delete ${folder.name} folder`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Folder"
        message={`Are you sure you want to delete "${folder.name}"?${cardCount > 0 ? ` This will permanently delete all ${cardCount} cards in this folder.` : ''}`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
