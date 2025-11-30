import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User extends SupabaseUser {
  profile?: Profile;
}