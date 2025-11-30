import { supabase } from '@/utils/supabase/client';
import type { Card } from '@/types/Card';

export async function createCard(folderId: string, question: string, answer: string): Promise<Card> {
  console.log('💾 createCard: Inserting card into database:', { folderId, question: question.substring(0, 50) + '...', answer: answer.substring(0, 50) + '...' });
  
  const insertData = {
    folder_id: folderId,
    question,
    answer,
  };
  
  console.log('📤 createCard: Sending data to database:', insertData);

  const { data, error } = await supabase
    .from('cards')
    .insert(insertData)
    .select()
    .single();

  console.log('📥 createCard: Database response:', { data, error });

  if (error) {
    console.error('❌ createCard: Database error:', error);
    console.error('❌ createCard: Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
  
  if (!data) {
    console.error('❌ createCard: No data returned from database');
    throw new Error('No data returned from database');
  }
  
  console.log('✅ createCard: Card created successfully with ID:', data.id);
  return data;
}