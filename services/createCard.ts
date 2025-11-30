import { supabase } from '@/utils/supabase/client';
import type { Card } from '@/types/Card';

export async function createCard(folderId: string, question: string, answer: string): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .insert({
      folder_id: folderId,
      question,
      answer,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}