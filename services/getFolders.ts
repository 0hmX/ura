import { supabase } from '@/utils/supabase/client';
import { mobileSupabase } from '@/utils/supabase/mobile-client';
import type { Folder } from '@/types/Folder';

// Detect if we're on mobile
const isMobile = typeof navigator !== 'undefined' && 
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const getSupabaseClient = () => isMobile ? mobileSupabase : supabase;

async function getFoldersWithRetry(userId?: string, retryCount = 0): Promise<Folder[]> {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  
  try {
    console.log('📂 getFolders: Fetching folders... (attempt', retryCount + 1, 'of', maxRetries + 1, ')');

    let user;
    if (userId) {
      console.log('👤 getFolders: Using provided userId:', userId);
      user = { id: userId };
    } else {
      // Add timeout for auth call specifically
      const authTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth getUser timeout')), 10000);
      });

      const client = getSupabaseClient();
      const authPromise = client.auth.getUser();
      console.log('🔐 getFolders: Getting user auth...');
      
      const authResult = await Promise.race([authPromise, authTimeout]) as any;
      user = authResult.data?.user;
      
      if (!user) {
        throw new Error('Authentication required. Please sign in again.');
      }

      console.log('👤 getFolders: User authenticated:', user.id);
    }

    // Add timeout for the database query (more generous for mobile)
    const queryTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 15000);
    });

    const client = getSupabaseClient();
    const queryPromise = client
      .from('folders')
      .select(`
        *,
        cards (*)
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: true });

    const { data, error } = await Promise.race([queryPromise, queryTimeout]) as any;

    console.log('📥 getFolders: Database response:', { 
      data: data ? `${data.length} folders` : 'null', 
      error 
    });

    if (error) {
      console.error('❌ getFolders: Database error:', error);
      
      // Retry on certain errors
      if ((error.message.includes('timeout') || error.message.includes('network')) && retryCount < maxRetries) {
        console.log('🔄 getFolders: Retrying due to network/timeout error...');
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
        return getFoldersWithRetry(userId, retryCount + 1);
      }
      
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
    const validFolders = data.filter((folder: any) => {
      if (!folder.id || !folder.name) {
        console.warn('⚠️ getFolders: Skipping invalid folder:', folder);
        return false;
      }
      return true;
    });

    console.log('✅ getFolders: Successfully loaded folders:', {
      total: validFolders.length,
      totalCards: validFolders.reduce((sum: number, folder: any) => sum + (folder.cards?.length || 0), 0)
    });

    return validFolders;
    
  } catch (err) {
    if (err instanceof Error && err.message.includes('timeout') && retryCount < maxRetries) {
      console.log('🔄 getFolders: Retrying due to timeout...');
      await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
      return getFoldersWithRetry(userId, retryCount + 1);
    }
    
    if (err instanceof Error) {
      throw err; // Re-throw known errors
    }
    
    console.error('❌ getFolders: Unexpected error:', err);
    throw new Error('Failed to load folders due to an unexpected error');
  }
}

export async function getFolders(userId?: string): Promise<Folder[]> {
  return getFoldersWithRetry(userId);
}