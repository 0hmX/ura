'use client';

import { useState } from 'react';
import { useAppContext } from '../store/AppContext';

export default function AddFolderModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const { addFolder } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addFolder(name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add New Folder</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            className="w-full p-2 border border-zinc-300 rounded-lg"
            autoFocus
          />
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-800 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Add Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}