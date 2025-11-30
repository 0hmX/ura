'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/store/AppContext';
import Flashcard from '@/components/Flashcard';
import StudyNavigation from '@/components/StudyNavigation';
import Header from '@/components/Header';

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
    <div className="flex flex-col items-center justify-center">
      <Header title={folder.name} backLink={`/folder/${id}`} />
      <div className="w-full px-4 mt-4">
        <Flashcard card={card} />
        <StudyNavigation onPrev={handlePrev} onNext={handleNext} />
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
