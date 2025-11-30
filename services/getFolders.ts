import { supabase } from '@/utils/supabase/client';
import type { Folder } from '@/types/Folder';

export async function getFolders(): Promise<Folder[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('folders')
    .select(`
      *,
      cards (*)
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}