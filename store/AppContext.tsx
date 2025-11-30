'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Folder } from '@/types/Folder';
import type { Card } from '@/types/Card';
import { getFolders } from '@/services/getFolders';
import { createFolder } from '@/services/createFolder';
import { deleteFolder } from '@/services/deleteFolder';
import { createCard } from '@/services/createCard';
import { deleteCard } from '@/services/deleteCard';
import { useAuth } from '@/hooks/useAuth';
interface AppContextType {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  addFolder: (name: string, description?: string) => Promise<void>;
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
      const data = await getFolders();
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

  const addFolder = async (name: string, description?: string) => {
    // Negative space programming: Early validation
    if (!name?.trim()) {
      const error = 'Folder name is required';
      setError(error);
      throw new Error(error);
    }

    try {
      setError(null);
      console.log('📁 AppContext: Creating folder:', name.trim());
      
      const newFolder = await createFolder(name.trim(), description?.trim());
      
      console.log('✅ AppContext: Folder created successfully:', newFolder);
      
      setFolders((prev) => {
        const updated = [...prev, newFolder];
        console.log('📂 AppContext: Updated folders list:', { 
          previousCount: prev.length, 
          newCount: updated.length 
        });
        return updated;
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create folder';
      console.error('❌ AppContext: Folder creation failed:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteFolderHandler = async (id: string) => {
    // Negative space programming: Early validation
    if (!id?.trim()) {
      const error = 'Folder ID is required';
      setError(error);
      throw new Error(error);
    }

    try {
      setError(null);
      console.log('🗑️ AppContext: Deleting folder:', id);
      
      // Find folder name for logging
      const folder = folders.find(f => f.id === id);
      const folderName = folder?.name || 'Unknown';
      
      await deleteFolder(id);
      
      console.log('✅ AppContext: Folder deleted successfully:', folderName);
      
      setFolders((prev) => {
        const updated = prev.filter((folder) => folder.id !== id);
        console.log('📂 AppContext: Updated folders list after deletion:', {
          previousCount: prev.length,
          newCount: updated.length,
          deletedFolder: folderName
        });
        return updated;
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete folder';
      console.error('❌ AppContext: Folder deletion failed:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const addCard = async (folderId: string, card: Omit<Card, 'id' | 'folder_id'>) => {
    try {
      setError(null);
      console.log('🃏 AppContext: Adding card to folder:', folderId, card);
      
      const newCard = await createCard(folderId, card.question, card.answer);
      console.log('✅ AppContext: Card created successfully:', newCard);
      
      setFolders((prev) => {
        console.log('📂 AppContext: Current folders before update:', prev.map(f => ({ id: f.id, name: f.name, cardCount: f.cards?.length || 0 })));
        
        const updated = prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, cards: [...(folder.cards || []), newCard] }
            : folder
        );
        
        console.log('📂 AppContext: Updated folders after adding card:', updated.map(f => ({ id: f.id, name: f.name, cardCount: f.cards?.length || 0 })));
        return updated;
      });
      
      console.log('✅ AppContext: State update completed');
    } catch (err) {
      console.error('❌ AppContext: Failed to create card:', err);
      console.error('❌ AppContext: Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(err instanceof Error ? err.message : 'Failed to create card');
      throw err;
    }
  };

  const deleteCardHandler = async (folderId: string, cardId: string) => {
    try {
      setError(null);
      await deleteCard(cardId);
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
        deleteFolder: deleteFolderHandler,
        addCard,
        deleteCard: deleteCardHandler,
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
