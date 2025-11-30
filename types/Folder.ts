import type { Card } from '@/types/Card';

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  cards?: Card[];
  created_at?: string;
  updated_at?: string;
}
