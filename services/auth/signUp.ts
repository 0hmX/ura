import { supabase } from '@/utils/supabase/client';

export async function signUp(email: string, password: string, username?: string) {
  // First, sign up the user
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
  
  // If user was created and confirmed immediately, create profile manually
  if (data.user && !data.user.email_confirmed_at) {
    // User needs email confirmation - profile will be created by trigger when they confirm
    return data;
  }
  
  // If user is confirmed immediately, create profile manually as backup
  if (data.user && data.user.email_confirmed_at) {
    try {
      await createProfileManually(data.user.id, email, username);
    } catch (profileError) {
      console.error('Failed to create profile manually:', profileError);
      // Don't throw - user account was created successfully
    }
  }
  
  return data;
}

async function createProfileManually(userId: string, email: string, username?: string) {
  const finalUsername = username || email.split('@')[0];
  
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: finalUsername,
      email: email,
    });
    
  if (error) throw error;
}