'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}