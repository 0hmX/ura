import { supabase } from '@/utils/supabase/client';

export async function signIn(emailOrUsername: string, password: string) {
  const isEmail = emailOrUsername.includes('@');
  
  if (isEmail) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailOrUsername,
      password,
    });
    
    if (error) throw error;
    return data;
  } else {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', emailOrUsername)
      .single();
    
    if (profileError || !profile) {
      throw new Error('Username not found');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });
    
    if (error) throw error;
    return data;
  }
}