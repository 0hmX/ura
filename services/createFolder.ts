import { supabase } from '@/utils/supabase/client';
import type { Folder } from '@/types/Folder';

export async function createFolder(name: string, description?: string): Promise<Folder> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('folders')
    .insert({ 
      name, 
      description,
      profile_id: user.id 
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, cards: [] };
}