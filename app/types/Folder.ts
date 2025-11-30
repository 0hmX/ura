import type { Card } from './Card';

export interface Folder {
  id: string;
  name: string;
  cards: Card[];
}
