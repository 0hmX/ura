'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useLogout';

export function UserMenu() {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) {
    return null;
  }

  return (
    <button
      onClick={logout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
    >
      Sign Out
    </button>
  );
}