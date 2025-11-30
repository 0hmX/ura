'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('🌐 PublicRoute: State check:', { 
    loading, 
    userEmail: user?.email || 'No user' 
  });

  useEffect(() => {
    if (!loading && user) {
      console.log('🏠 PublicRoute: User detected, redirecting to home');
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) {
    console.log('⏳ PublicRoute: Showing loading spinner (auth loading)');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    console.log('🔄 PublicRoute: User authenticated, hiding content (should redirect)');
    return null;
  }

  console.log('✅ PublicRoute: No user, showing public content');
  return <>{children}</>;
}