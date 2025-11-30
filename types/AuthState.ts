import type { User } from './User';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}