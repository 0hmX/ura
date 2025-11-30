'use client';

type Mode = 'manual' | 'ai';

export default function ModeSwitcher({
  mode,
  onModeChange,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onModeChange('manual')}
        className={`px-3 py-1 text-sm rounded-full ${
          mode === 'manual' ? 'bg-zinc-900 text-white' : 'bg-zinc-200'
        }`}
      >
        Manual
      </button>
      <button
        onClick={() => onModeChange('ai')}
        className={`px-3 py-1 text-sm rounded-full ${
          mode === 'ai' ? 'bg-zinc-900 text-white' : 'bg-zinc-200'
        }`}
      >
        AI
      </button>
    </div>
  );
}
