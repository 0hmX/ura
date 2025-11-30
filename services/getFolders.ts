import { supabase } from '@/utils/supabase/client';
import type { Folder } from '@/types/Folder';

export async function getFolders(): Promise<Folder[]> {
  console.log('📂 getFolders: Fetching folders...');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required. Please sign in again.');
    }

    console.log('👤 getFolders: User authenticated:', user.id);

    const { data, error } = await supabase
      .from('folders')
      .select(`
        *,
        cards (*)
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: true });

    console.log('📥 getFolders: Database response:', { 
      data: data ? `${data.length} folders` : 'null', 
      error 
    });

    if (error) {
      console.error('❌ getFolders: Database error:', error);
      
      // Map common database errors to user-friendly messages
      if (error.code === '42501') {
        throw new Error('Permission denied. Please sign in again.');
      }
      if (error.code === 'PGRST301') {
        throw new Error('Database connection error. Please try again.');
      }
      
      throw new Error(`Failed to load folders: ${error.message}`);
    }

    if (!data) {
      console.log('📂 getFolders: No folders found, returning empty array');
      return [];
    }

    // Validate folder data structure
    const validFolders = data.filter(folder => {
      if (!folder.id || !folder.name) {
        console.warn('⚠️ getFolders: Skipping invalid folder:', folder);
        return false;
      }
      return true;
    });

    console.log('✅ getFolders: Successfully loaded folders:', {
      total: validFolders.length,
      totalCards: validFolders.reduce((sum, folder) => sum + (folder.cards?.length || 0), 0)
    });

    return validFolders;
    
  } catch (err) {
    if (err instanceof Error) {
      throw err; // Re-throw known errors
    }
    
    console.error('❌ getFolders: Unexpected error:', err);
    throw new Error('Failed to load folders due to an unexpected error');
  }
}