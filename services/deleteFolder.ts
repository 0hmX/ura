import { supabase } from '@/utils/supabase/client';

export async function deleteFolder(id: string): Promise<void> {
  // Negative space programming: Early validation
  if (!id?.trim()) {
    throw new Error('Folder ID is required');
  }

  console.log('🗑️ deleteFolder: Deleting folder:', id);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required. Please sign in again.');
    }

    console.log('👤 deleteFolder: User authenticated:', user.id);

    // First, verify the folder exists and belongs to the user
    const { data: folder, error: fetchError } = await supabase
      .from('folders')
      .select('id, name, profile_id')
      .eq('id', id)
      .eq('profile_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('Folder not found or access denied');
      }
      throw new Error(`Failed to verify folder: ${fetchError.message}`);
    }

    if (!folder) {
      throw new Error('Folder not found or access denied');
    }

    console.log('📁 deleteFolder: Folder verified:', folder.name);

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('profile_id', user.id); // Double-check ownership

    console.log('📥 deleteFolder: Database response:', { error });

    if (error) {
      console.error('❌ deleteFolder: Database error:', error);
      
      // Map common database errors to user-friendly messages
      if (error.code === '23503') {
        throw new Error('Cannot delete folder: it contains cards that cannot be removed');
      }
      if (error.code === '42501') {
        throw new Error('Permission denied. Please sign in again.');
      }
      
      throw new Error(`Failed to delete folder: ${error.message}`);
    }

    console.log('✅ deleteFolder: Folder deleted successfully');
    
  } catch (err) {
    if (err instanceof Error) {
      throw err; // Re-throw known errors
    }
    
    console.error('❌ deleteFolder: Unexpected error:', err);
    throw new Error('Failed to delete folder due to an unexpected error');
  }
}