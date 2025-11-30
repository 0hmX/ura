import { supabase } from '@/utils/supabase/client';
import type { Profile } from '@/types/User';

export async function createMissingProfile(userId: string): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const username = user.email?.split('@')[0] || 'user';
    const timestamp = Date.now();
    const finalUsername = `${username}_${timestamp}`;
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: finalUsername,
        email: user.email || '',
      })
      .select()
      .single();
      
    if (error) {
      return null;
    }
    
    return data;
  } catch (err) {
    return null;
  }
}