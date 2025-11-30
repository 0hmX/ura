'use client';

import { useState, useEffect } from 'react';
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

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);
    } catch (err) {
      setProfile(null);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userData = session?.user ?? null;
        setUser(userData);
        
        if (userData) {
          await loadProfile(userData.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        try {
          const userData = session?.user ?? null;
          setUser(userData);
          
          if (userData) {
            await loadProfile(userData.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Authentication error');
        } finally {
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