'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/User';
import type { Profile } from '@/types/User';
import { AuthContext } from '@/store/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { signIn as signInService } from '@/services/auth/signIn';
import { signUp as signUpService } from '@/services/auth/signUp';
import { signOut as signOutService } from '@/services/auth/signOut';
import { getProfile } from '@/services/profile/getProfile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadProfile = async (userId: string) => {
    console.log('🔍 AuthProvider: Loading profile for userId:', userId);
    try {
      const profileData = await getProfile(userId);
      console.log('✅ AuthProvider: Profile loaded:', profileData?.username || 'No profile');
      setProfile(profileData);
    } catch (err) {
      console.error('💥 AuthProvider: Profile load error:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
  const getInitialSession = async () => {
    console.log('🔄 AuthProvider: Getting initial session...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userData = session?.user ?? null;
      console.log('👤 AuthProvider: Initial session user:', userData?.email || 'No user');
      setUser(userData);
      
      if (userData) {
        console.log('📝 AuthProvider: Loading profile for user:', userData.id);
        await loadProfile(userData.id);
      } else {
        console.log('❌ AuthProvider: No user, clearing profile');
        setProfile(null);
      }
    } catch (err) {
      console.error('💥 AuthProvider: Session error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      console.log('✅ AuthProvider: Initial session loading complete');
      setLoading(false);
    }
  };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 AuthProvider: Auth state change:', event, session?.user?.email || 'No user');
        console.log('📱 AuthProvider: User agent:', navigator.userAgent.substring(0, 100));
        console.log('🌐 AuthProvider: URL:', window.location.href);
        
        try {
          const userData = session?.user ?? null;
          setUser(userData);
          
          if (userData) {
            console.log('📝 AuthProvider: Loading profile for user:', userData.id);
            console.log('👤 AuthProvider: User metadata:', {
              email: userData.email,
              emailVerified: userData.email_confirmed_at,
              lastSignIn: userData.last_sign_in_at,
              createdAt: userData.created_at
            });
            await loadProfile(userData.id);
          } else {
            console.log('❌ AuthProvider: No user, clearing profile');
            setProfile(null);
            if (event === 'SIGNED_OUT') {
              console.log('🚪 AuthProvider: SIGNED_OUT event, redirecting to signin');
              router.push('/auth/signin');
            }
          }
        } catch (err) {
          console.error('💥 AuthProvider: Auth state change error:', err);
          setError(err instanceof Error ? err.message : 'Authentication error');
        } finally {
          console.log('✅ AuthProvider: Auth state change complete');
          setLoading(false);
        }
      }
    );

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInService(emailOrUsername, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      setError(null);
      setLoading(true);
      await signUpService(email, password, username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await signOutService();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      error, 
      signIn, 
      signUp, 
      signOut, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
}