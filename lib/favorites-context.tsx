"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  type FavoriteList,
  type FavoriteEntry,
  addCardToList,
  removeCardFromList,
  createFavoriteList,
  deleteFavoriteList,
  renameFavoriteList,
} from "@/api/favorites";

interface FavoritesContextValue {
  lists: FavoriteList[];
  cardsByList: Record<string, Record<number, FavoriteEntry>>;
  loading: boolean;

  isInList: (listId: string, cardId: number) => boolean;
  isInAnyList: (cardId: number) => boolean;

  addToList: (listId: string, cardId: number) => Promise<void>;
  removeFromList: (listId: string, cardId: number) => Promise<void>;

  createList: (name: string) => Promise<string>;
  deleteList: (listId: string) => Promise<void>;
  renameList: (listId: string, name: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lists, setLists] = useState<FavoriteList[]>([]);
  const [cardsByList, setCardsByList] = useState<Record<string, Record<number, FavoriteEntry>>>({});
  const [loading, setLoading] = useState(false);

  const cardUnsubs = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    if (!user) {
      setLists([]);
      setCardsByList({});
      cardUnsubs.current.forEach((unsub) => unsub());
      cardUnsubs.current.clear();
      return;
    }

    setLoading(true);

    const listsUnsub = onSnapshot(
      collection(db, "users", user.uid, "favoriteLists"),
      (snapshot) => {
        const newLists: FavoriteList[] = [];
        const newListIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          newLists.push({ id: docSnap.id, ...docSnap.data() } as FavoriteList);
          newListIds.add(docSnap.id);
        });

        newLists.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return aTime - bTime;
        });

        setLists(newLists);
        setLoading(false);

        // Remove listeners for deleted lists
        cardUnsubs.current.forEach((unsub, listId) => {
          if (!newListIds.has(listId)) {
            unsub();
            cardUnsubs.current.delete(listId);
            setCardsByList((prev) => {
              const next = { ...prev };
              delete next[listId];
              return next;
            });
          }
        });

        // Add listeners for new lists
        newListIds.forEach((listId) => {
          if (!cardUnsubs.current.has(listId)) {
            const unsub = onSnapshot(
              collection(db, "users", user.uid, "favoriteLists", listId, "cards"),
              (cardSnap) => {
                const entries: Record<number, FavoriteEntry> = {};
                cardSnap.forEach((cardDoc) => {
                  const data = cardDoc.data() as FavoriteEntry;
                  entries[data.cardId] = data;
                });
                setCardsByList((prev) => ({ ...prev, [listId]: entries }));
              }
            );
            cardUnsubs.current.set(listId, unsub);
          }
        });
      }
    );

    return () => {
      listsUnsub();
      cardUnsubs.current.forEach((unsub) => unsub());
      cardUnsubs.current.clear();
    };
  }, [user]);

  function isInList(listId: string, cardId: number) {
    return !!cardsByList[listId]?.[cardId];
  }

  function isInAnyList(cardId: number) {
    return Object.values(cardsByList).some((cards) => !!cards[cardId]);
  }

  async function addToList(listId: string, cardId: number) {
    if (!user) return;
    await addCardToList(user.uid, listId, cardId);
  }

  async function removeFromList(listId: string, cardId: number) {
    if (!user) return;
    await removeCardFromList(user.uid, listId, cardId);
  }

  async function createList(name: string): Promise<string> {
    if (!user) return "";
    return createFavoriteList(user.uid, name);
  }

  async function deleteList(listId: string) {
    if (!user || lists.length <= 1) return;
    const cardIds = Object.keys(cardsByList[listId] ?? {}).map(Number);
    await deleteFavoriteList(user.uid, listId, cardIds);
  }

  async function renameList(listId: string, name: string) {
    if (!user) return;
    await renameFavoriteList(user.uid, listId, name);
  }

  return (
    <FavoritesContext
      value={{
        lists,
        cardsByList,
        loading,
        isInList,
        isInAnyList,
        addToList,
        removeFromList,
        createList,
        deleteList,
        renameList,
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
