import Link from 'next/link';
import { ReactNode } from 'react';
import { UserMenu } from '@/components/auth/UserMenu';

export default function Header({
  title,
  backLink,
  children,
  leftActions,
  showUserMenu = false,
}: {
  title: string;
  backLink?: string;
  children?: ReactNode;
  leftActions?: ReactNode;
  showUserMenu?: boolean;
}) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-zinc-200">
      <div className="flex items-center gap-4">
        {backLink && (
          <Link href={backLink} className="text-xl font-bold text-zinc-900">
            &larr;
          </Link>
        )}
        <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
        {leftActions && (
          <div className="flex items-center gap-2">
            {leftActions}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {children}
        {showUserMenu && <UserMenu />}
      </div>
    </header>
  );
}