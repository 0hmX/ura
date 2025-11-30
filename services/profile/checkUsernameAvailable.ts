import { supabase } from '@/utils/supabase/client';

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_username_available', {
    username_to_check: username
  });
  
  if (error) throw error;
  return data;
}