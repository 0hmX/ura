'use client';

import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">
        Welcome, {profile.username}
      </span>
      <button
        onClick={signOut}
        className="text-sm text-blue-600 hover:text-blue-500"
      >
        Sign Out
      </button>
    </div>
  );
}