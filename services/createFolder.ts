import { supabase } from '@/utils/supabase/client';
import type { Folder } from '@/types/Folder';

export async function createFolder(name: string, description?: string): Promise<Folder> {
  // Negative space programming: Early validation to fail fast
  if (!name?.trim()) {
    throw new Error('Folder name is required');
  }
  
  if (name.trim().length < 2) {
    throw new Error('Folder name must be at least 2 characters long');
  }
  
  if (name.trim().length > 50) {
    throw new Error('Folder name must be 50 characters or less');
  }
  
  if (description && description.trim().length > 200) {
    throw new Error('Description must be 200 characters or less');
  }
  
  // Validate for potentially problematic characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name.trim())) {
    throw new Error('Folder name contains invalid characters');
  }

  console.log('📁 createFolder: Creating folder:', { 
    name: name.trim(), 
    description: description?.trim(),
    hasDescription: !!description?.trim()
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required. Please sign in again.');
    }

    console.log('👤 createFolder: User authenticated:', user.id);

    const insertData = {
      name: name.trim(),
      description: description?.trim() || null,
      profile_id: user.id
    };

    console.log('📤 createFolder: Inserting folder data:', insertData);

    const { data, error } = await supabase
      .from('folders')
      .insert(insertData)
      .select()
      .single();

    console.log('📥 createFolder: Database response:', { data, error });

    if (error) {
      console.error('❌ createFolder: Database error:', error);
      
      // Map common database errors to user-friendly messages
      if (error.code === '23505') {
        throw new Error('A folder with this name already exists');
      }
      if (error.code === '23503') {
        throw new Error('User profile not found. Please sign out and sign in again.');
      }
      if (error.code === '42501') {
        throw new Error('Permission denied. Please sign in again.');
      }
      if (error.code === '23514') {
        throw new Error('Folder name or description contains invalid content');
      }
      
      throw new Error(`Failed to create folder: ${error.message}`);
    }

    if (!data) {
      console.error('❌ createFolder: No data returned from database');
      throw new Error('Folder creation failed - no data returned');
    }

    console.log('✅ createFolder: Folder created successfully with ID:', data.id);
    
    // Return folder with empty cards array for consistency
    return { ...data, cards: [] };
    
  } catch (err) {
    if (err instanceof Error) {
      throw err; // Re-throw known errors
    }
    
    console.error('❌ createFolder: Unexpected error:', err);
    throw new Error('Failed to create folder due to an unexpected error');
  }
}