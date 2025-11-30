import Link from 'next/link';

export default function StudyButton({ folderId }: { folderId: string }) {
  return (
    <Link
      href={`/folder/${folderId}/study`}
      className="p-2 rounded-full bg-blue-500 text-white"
    >
      Study
    </Link>
  );
}
