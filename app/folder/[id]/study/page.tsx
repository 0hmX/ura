'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '../../../store/AppContext';
import Flashcard from '../../../components/Flashcard';

export default function StudyPage() {
  const { id } = useParams();
  const { getFolder } = useAppContext();
  const folder = getFolder(id as string);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!folder || folder.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>No cards to study in this folder.</p>
        <Link href={`/folder/${id}`} className="text-blue-500">
          Go back to folder
        </Link>
      </div>
    );
  }

  const card = folder.cards[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % folder.cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? folder.cards.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-100">
      <div className="w-full max-w-md p-8">
        <Flashcard card={card} />
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            className="px-6 py-2 font-semibold text-zinc-800 bg-white rounded-lg shadow"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 font-semibold text-zinc-800 bg-white rounded-lg shadow"
          >
            Next
          </button>
        </div>
        <div className="text-center mt-4 text-sm text-zinc-500">
          Card {currentIndex + 1} of {folder.cards.length}
        </div>
        <div className="text-center mt-4">
          <Link href={`/folder/${id}`} className="text-blue-500">
            Back to folder
          </Link>
        </div>
      </div>
    </div>
  );
}