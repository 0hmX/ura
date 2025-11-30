# Supabase Integration Report for Ura Flashcard Application

## Executive Summary

This report outlines the comprehensive steps required to integrate Supabase as the backend database for the Ura flashcard application. The current application uses localStorage for data persistence. This migration will provide cloud-based data storage, user authentication, real-time synchronization, and enhanced data security.

## Current Application Analysis

### Data Models
- **Card Interface** (`types/Card.ts:1-5`): Simple structure with id, question, and answer
- **Folder Interface** (`types/Folder.ts:3-7`): Contains id, name, and array of cards
- **Data Storage**: Currently uses localStorage (`store/AppContext.tsx:22-30`)
- **State Management**: React Context with local state operations

### Technology Stack
- Next.js 16.0.5
- React 19.2.0
- TypeScript
- Tailwind CSS
- No current database integration

## Implementation Plan

### Phase 1: Environment Setup and Dependencies

#### Step 1.1: Install Supabase Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install --save-dev @types/uuid uuid
```

#### Step 1.2: Environment Configuration
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Step 1.3: Environment Variables Security
- Add `.env.local` to `.gitignore`
- Create `.env.example` template for other developers
- Document environment setup in README

### Phase 2: Database Schema Design

#### Step 2.1: Supabase Tables Structure

**Users Table** (handled by Supabase Auth):
```sql
-- Already provided by Supabase Auth
-- Contains: id, email, created_at, etc.
```

**Folders Table**:
```sql
CREATE TABLE folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Cards Table**:
```sql
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Step 2.2: Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Folders policies
CREATE POLICY "Users can view their own folders" ON folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);

-- Cards policies
CREATE POLICY "Users can view cards in their folders" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM folders 
      WHERE folders.id = cards.folder_id 
      AND folders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cards in their folders" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM folders 
      WHERE folders.id = cards.folder_id 
      AND folders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their folders" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM folders 
      WHERE folders.id = cards.folder_id 
      AND folders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards in their folders" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM folders 
      WHERE folders.id = cards.folder_id 
      AND folders.user_id = auth.uid()
    )
  );
```

### Phase 3: Supabase Client Setup

#### Step 3.1: Create Supabase Client Configuration
Create `utils/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

#### Step 3.2: Create Server-Side Client
Create `utils/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component - ignore
          }
        },
      },
    }
  );
};
```

### Phase 4: Type Definitions Update

#### Step 4.1: Generate Database Types
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > types/database.types.ts
```

#### Step 4.2: Update Existing Types
Update `types/Card.ts`:
```typescript
export interface Card {
  id: string;
  folder_id: string;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
}
```

Update `types/Folder.ts`:
```typescript
import type { Card } from '@/types/Card';

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  cards?: Card[];
  created_at?: string;
  updated_at?: string;
}
```

### Phase 5: Authentication Implementation

#### Step 5.1: Create Auth Context
Create `store/AuthContext.tsx`:
```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Phase 6: Database Operations Layer

#### Step 6.1: Create Database Service
Create `services/database.ts`:
```typescript
import { supabase } from '@/utils/supabase/client';
import type { Card, Folder } from '@/types';

export class DatabaseService {
  // Folder operations
  static async getFolders(): Promise<Folder[]> {
    const { data, error } = await supabase
      .from('folders')
      .select(`
        *,
        cards (*)
      `)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createFolder(name: string): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    return { ...data, cards: [] };
  }

  static async updateFolder(id: string, name: string): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteFolder(id: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Card operations
  static async createCard(folderId: string, question: string, answer: string): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .insert({
        folder_id: folderId,
        question,
        answer,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCard(id: string, question: string, answer: string): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .update({
        question,
        answer,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get single folder with cards
  static async getFolder(id: string): Promise<Folder | null> {
    const { data, error } = await supabase
      .from('folders')
      .select(`
        *,
        cards (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}
```

### Phase 7: Update App Context for Supabase

#### Step 7.1: Modify AppContext for Database Integration
Update `store/AppContext.tsx`:
```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Folder } from '@/types/Folder';
import type { Card } from '@/types/Card';
import { DatabaseService } from '@/services/database';
import { useAuth } from '@/store/AuthContext';

interface AppContextType {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  addFolder: (name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  addCard: (folderId: string, card: Omit<Card, 'id' | 'folder_id'>) => Promise<void>;
  deleteCard: (folderId: string, cardId: string) => Promise<void>;
  getFolder: (id: string) => Folder | undefined;
  refreshFolders: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshFolders = async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await DatabaseService.getFolders();
      setFolders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFolders();
  }, [user]);

  const addFolder = async (name: string) => {
    try {
      setError(null);
      const newFolder = await DatabaseService.createFolder(name);
      setFolders((prev) => [...prev, newFolder]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
      throw err;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      setError(null);
      await DatabaseService.deleteFolder(id);
      setFolders((prev) => prev.filter((folder) => folder.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
      throw err;
    }
  };

  const addCard = async (folderId: string, card: Omit<Card, 'id' | 'folder_id'>) => {
    try {
      setError(null);
      const newCard = await DatabaseService.createCard(folderId, card.question, card.answer);
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, cards: [...(folder.cards || []), newCard] }
            : folder
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
      throw err;
    }
  };

  const deleteCard = async (folderId: string, cardId: string) => {
    try {
      setError(null);
      await DatabaseService.deleteCard(cardId);
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                cards: (folder.cards || []).filter((card) => card.id !== cardId)
              }
            : folder
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete card');
      throw err;
    }
  };

  const getFolder = (id: string) => {
    return folders.find((folder) => folder.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        folders,
        loading,
        error,
        addFolder,
        deleteFolder,
        addCard,
        deleteCard,
        getFolder,
        refreshFolders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
```

### Phase 8: Authentication UI Components

#### Step 8.1: Create Authentication Components
Create `components/AuthModal.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/store/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Phase 9: Layout Updates

#### Step 9.1: Update Root Layout
Update `app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/store/AppContext';
import { AuthProvider } from '@/store/AuthContext';

export const metadata: Metadata = {
  title: 'Ura - Flashcard App',
  description: 'Learn with intelligent flashcards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Phase 10: Data Migration Strategy

#### Step 10.1: Migration Component
Create `components/DataMigration.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { DatabaseService } from '@/services/database';
import type { Folder } from '@/types/Folder';

export function DataMigration() {
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMigration = () => {
      const localData = localStorage.getItem('folders');
      if (localData && user) {
        const folders = JSON.parse(localData);
        if (folders.length > 0) {
          setMigrationNeeded(true);
        }
      }
    };

    checkMigration();
  }, [user]);

  const migrateData = async () => {
    setMigrating(true);
    try {
      const localData = localStorage.getItem('folders');
      if (localData) {
        const folders: Folder[] = JSON.parse(localData);
        
        for (const folder of folders) {
          const newFolder = await DatabaseService.createFolder(folder.name);
          
          if (folder.cards) {
            for (const card of folder.cards) {
              await DatabaseService.createCard(newFolder.id, card.question, card.answer);
            }
          }
        }
        
        localStorage.removeItem('folders');
        setMigrationNeeded(false);
      }
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setMigrating(false);
    }
  };

  if (!migrationNeeded) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-medium text-yellow-800">Data Migration Available</h3>
      <p className="text-yellow-700 text-sm mt-1">
        We found local data that can be migrated to your cloud account.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={migrateData}
          disabled={migrating}
          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
        >
          {migrating ? 'Migrating...' : 'Migrate Data'}
        </button>
        <button
          onClick={() => setMigrationNeeded(false)}
          className="bg-gray-300 px-3 py-1 rounded text-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
```

### Phase 11: Error Handling and Loading States

#### Step 11.1: Update Components for Async Operations
All existing components will need updates to handle:
- Loading states during database operations
- Error states with user-friendly messages
- Optimistic updates for better user experience
- Network connectivity issues

### Phase 12: Testing Strategy

#### Step 12.1: Unit Tests
- Database service methods
- Auth context functionality
- Data migration logic

#### Step 12.2: Integration Tests
- Full user authentication flow
- CRUD operations for folders and cards
- Real-time data synchronization

#### Step 12.3: End-to-End Tests
- Complete user journey from signup to study session
- Data persistence across sessions
- Multi-device synchronization

### Phase 13: Performance Optimization

#### Step 13.1: Caching Strategy
- Implement React Query for client-side caching
- Optimize database queries with proper indexing
- Implement pagination for large datasets

#### Step 13.2: Real-time Updates
- Subscribe to database changes using Supabase real-time
- Implement optimistic updates for immediate user feedback

### Phase 14: Security Considerations

#### Step 14.1: Environment Security
- Never commit API keys to version control
- Use different environments for development/production
- Implement proper key rotation procedures

#### Step 14.2: Database Security
- Row Level Security policies enforced
- Input validation and sanitization
- Rate limiting for API endpoints

## Implementation Timeline

1. **Week 1**: Environment setup, dependencies, database schema
2. **Week 2**: Authentication system and basic CRUD operations
3. **Week 3**: UI updates, error handling, data migration
4. **Week 4**: Testing, optimization, and deployment

## Risk Assessment

### High Risk
- Data loss during migration
- Authentication configuration errors
- Breaking changes to existing UI

### Medium Risk
- Performance degradation
- Network connectivity issues
- User experience during transition

### Low Risk
- Minor UI inconsistencies
- Non-critical feature delays

## Rollback Strategy

1. Keep localStorage backup during initial deployment
2. Feature flags for gradual rollout
3. Database backup before schema changes
4. Ability to revert to localStorage-only mode

This comprehensive plan ensures a smooth transition from localStorage to Supabase while maintaining data integrity and user experience throughout the migration process.