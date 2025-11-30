import type { Card } from '@/types/Card';

export interface Folder {
  id: string;
  name: string;
  cards: Card[];
}
