import { supabase } from '@/utils/supabase/client';
import type { Profile } from '@/types/User';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
}