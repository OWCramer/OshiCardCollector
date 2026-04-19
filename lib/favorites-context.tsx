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
import { type FavoriteEntry, addFavorite, removeFavorite } from "@/api/favorites";

interface FavoritesContextValue {
  favorites: Record<number, FavoriteEntry>;
  loading: boolean;
  toggleFavorite: (cardId: number) => Promise<void>;
  isFavorite: (cardId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Record<number, FavoriteEntry>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavorites({});
      return;
    }

    setLoading(true);
    const favoritesCol = collection(db, "users", user.uid, "favorites");

    const unsubscribe = onSnapshot(favoritesCol, (snapshot) => {
      const entries: Record<number, FavoriteEntry> = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as FavoriteEntry;
        entries[data.cardId] = data;
      });
      setFavorites(entries);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  async function toggleFavorite(cardId: number) {
    if (!user) return;
    if (favorites[cardId]) {
      await removeFavorite(user.uid, cardId);
    } else {
      await addFavorite(user.uid, cardId);
    }
  }

  return (
    <FavoritesContext
      value={{
        favorites,
        loading,
        toggleFavorite,
        isFavorite: (cardId) => !!favorites[cardId],
      }}
    >
      {children}
    </FavoritesContext>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within a FavoritesProvider");
  return context;
}
