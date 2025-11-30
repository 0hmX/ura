import Link from 'next/link';

export default function Header({
  title,
  backLink,
}: {
  title: string;
  backLink?: string;
}) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-zinc-200">
      {backLink ? (
        <Link href={backLink} className="text-xl font-bold text-zinc-900">
          &larr; {title}
        </Link>
      ) : (
        <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
      )}
    </header>
  );
}
