import { supabase } from '@/utils/supabase/client';

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}