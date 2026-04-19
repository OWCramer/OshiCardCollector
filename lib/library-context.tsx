"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { type LibraryEntry, addCardToLibrary } from "@/api/library";

interface LibraryContextValue {
  library: Record<number, LibraryEntry>;
  loading: boolean;
  addCard: (cardId: number) => Promise<void>;
  getQuantity: (cardId: number) => number;
  isInLibrary: (cardId: number) => boolean;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [library, setLibrary] = useState<Record<number, LibraryEntry>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLibrary({});
      return;
    }

    setLoading(true);
    const libraryCol = collection(db, "users", user.uid, "library");

    const unsubscribe = onSnapshot(libraryCol, (snapshot) => {
      const entries: Record<number, LibraryEntry> = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as LibraryEntry;
        entries[data.cardId] = data;
      });
      setLibrary(entries);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  async function addCard(cardId: number) {
    if (!user || library[cardId]) return;
    await addCardToLibrary(user.uid, cardId);
  }

  return (
    <LibraryContext
      value={{
        library,
        loading,
        addCard,
        getQuantity: (cardId) => library[cardId]?.quantity ?? 0,
        isInLibrary: (cardId) => !!library[cardId],
      }}
    >
      {children}
    </LibraryContext>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used within a LibraryProvider");
  return context;
}
