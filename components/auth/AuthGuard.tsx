'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('🛡️ AuthGuard: State check:', { 
    loading, 
    userEmail: user?.email || 'No user' 
  });

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔄 AuthGuard: No user detected, redirecting to signin');
      router.push('/auth/signin');
    }
  }, [loading, user, router]);

  if (loading) {
    console.log('⏳ AuthGuard: Showing loading spinner (auth loading)');
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('🚫 AuthGuard: No user, showing loading spinner while redirecting');
    return <LoadingSpinner />;
  }

  console.log('✅ AuthGuard: User authenticated, showing content');
  return <>{children}</>;
}