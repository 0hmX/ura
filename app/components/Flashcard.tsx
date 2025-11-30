'use client';

import { useState } from 'react';
import type { Card } from '../types/Card';

export default function Flashcard({ card }: { card: Card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-64 perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        <div className="absolute w-full h-full flex items-center justify-center p-8 bg-white rounded-lg shadow-lg backface-hidden">
          <p className="text-xl">{card.question}</p>
        </div>
        <div className="absolute w-full h-full flex items-center justify-center p-8 bg-white rounded-lg shadow-lg rotate-y-180 backface-hidden">
          <p className="text-xl">{card.answer}</p>
        </div>
      </div>
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
