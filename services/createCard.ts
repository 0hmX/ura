import { supabase } from '@/utils/supabase/client';
import type { Card } from '@/types/Card';

export async function createCard(folderId: string, question: string, answer: string): Promise<Card> {
  // Negative space programming: Early validation to fail fast
  if (!folderId?.trim()) {
    throw new Error('Folder ID is required');
  }
  if (!question?.trim()) {
    throw new Error('Question cannot be empty');
  }
  if (!answer?.trim()) {
    throw new Error('Answer cannot be empty');
  }
  
  console.log('💾 createCard: Inserting card into database:', { 
    folderId, 
    question: question.substring(0, 50) + '...', 
    answer: answer.substring(0, 50) + '...' 
  });
  
  const insertData = {
    folder_id: folderId.trim(),
    question: question.trim(),
    answer: answer.trim(),
  };
  
  console.log('📤 createCard: Sending data to database:', insertData);

  try {
    const { data, error } = await supabase
      .from('cards')
      .insert(insertData)
      .select()
      .single();

    console.log('📥 createCard: Database response:', { data, error });

    if (error) {
      console.error('❌ createCard: Database error:', error);
      
      // Map common database errors to user-friendly messages
      if (error.code === '23503') {
        throw new Error('Folder not found or access denied');
      }
      if (error.code === '23505') {
        throw new Error('This card already exists in the folder');
      }
      if (error.code === '42501') {
        throw new Error('Permission denied. Please sign in again.');
      }
      
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data) {
      console.error('❌ createCard: No data returned from database');
      throw new Error('Card creation failed - no data returned');
    }
    
    console.log('✅ createCard: Card created successfully with ID:', data.id);
    return data;
    
  } catch (err) {
    if (err instanceof Error) {
      throw err; // Re-throw known errors
    }
    
    console.error('❌ createCard: Unexpected error:', err);
    throw new Error('Failed to create card due to an unexpected error');
  }
}