import { supabase } from '@/utils/supabase/client';

export async function signUp(email: string, password: string, username?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username || email.split('@')[0],
      },
    },
  });
  
  if (error) throw error;
  return data;
}