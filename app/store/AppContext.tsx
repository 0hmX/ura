'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Folder } from '../types/Folder';
import type { Card } from '../types/Card';

interface AppContextType {
  folders: Folder[];
  addFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  addCard: (folderId: string, card: Omit<Card, 'id'>) => void;
  deleteCard: (folderId: string, cardId: string) => void;
  getFolder: (id: string) => Folder | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const storedFolders = localStorage.getItem('folders');
    if (storedFolders) {
      setFolders(JSON.parse(storedFolders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
  }, [folders]);

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      cards: [],
    };
    setFolders((prevFolders) => [...prevFolders, newFolder]);
  };

  const deleteFolder = (id: string) => {
    setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== id));
  };

  const addCard = (folderId: string, card: Omit<Card, 'id'>) => {
    const newCard: Card = { ...card, id: crypto.randomUUID() };
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId
          ? { ...folder, cards: [...folder.cards, newCard] }
          : folder
      )
    );
  };

  const deleteCard = (folderId: string, cardId: string) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId
          ? { ...folder, cards: folder.cards.filter((card) => card.id !== cardId) }
          : folder
      )
    );
  };

  const getFolder = (id: string) => {
    return folders.find((folder) => folder.id === id);
  };

  return (
    <AppContext.Provider
      value={{ folders, addFolder, deleteFolder, addCard, deleteCard, getFolder }}
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
