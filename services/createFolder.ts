import { supabase } from '@/utils/supabase/client';
import type { Folder } from '@/types/Folder';

export async function createFolder(name: string): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return { ...data, cards: [] };
}