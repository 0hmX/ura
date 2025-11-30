'use client';

import { Plus } from 'lucide-react';

export default function AddCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
    >
      <Plus />
    </button>
  );
}
