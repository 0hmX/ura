import { supabase } from '@/utils/supabase/client';
import type { Folder } from '@/types/Folder';

export async function getFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select(`
      *,
      cards (*)
    `)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}