'use client';

export default function StudyNavigation({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex justify-between mt-8 px-4">
      <button
        onClick={onPrev}
        className="px-6 py-2 font-semibold text-zinc-800 bg-white rounded-lg shadow"
      >
        Prev
      </button>
      <button
        onClick={onNext}
        className="px-6 py-2 font-semibold text-zinc-800 bg-white rounded-lg shadow"
      >
        Next
      </button>
    </div>
  );
}
