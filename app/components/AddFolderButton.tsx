'use client';

import { Plus } from 'lucide-react';

export default function AddFolderButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 p-4 rounded-full bg-zinc-900 text-white shadow-lg"
    >
      <Plus size={24} />
    </button>
  );
}
