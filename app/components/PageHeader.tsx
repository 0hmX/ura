export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-zinc-200">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
