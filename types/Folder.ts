import type { Card } from '@/types/Card';

export interface Folder {
  id: string;
  profile_id: string;
  name: string;
  description?: string;
  cards?: Card[];
  created_at?: string;
  updated_at?: string;
}
