import { supabase } from '@/utils/supabase/client';

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}