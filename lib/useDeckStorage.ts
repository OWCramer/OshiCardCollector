"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export interface SavedDeckMeta {
  id: string;
  name: string;
  cardCount: number;
  isWip: boolean;
  oshiCardId?: number;
  oshiImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawDeckCard {
  cardId: number;
  quantity: number;
}

export function useDeckStorage() {
  const { user } = useAuth();

  function decksCol() {
    if (!user) throw new Error("Not authenticated");
    return collection(db, "users", user.uid, "decks");
  }

  function deckDoc(deckId: string) {
    if (!user) throw new Error("Not authenticated");
    return doc(db, "users", user.uid, "decks", deckId);
  }

  /**
   * Save a deck. If `deckId` is provided the existing document is overwritten;
   * otherwise a new document is created.
   */
  async function saveDeck(
    name: string,
    cards: RawDeckCard[],
    isWip: boolean,
    deckId?: string,
    oshiCardId?: number,
    oshiImageUrl?: string
  ): Promise<string> {
    const cardCount = cards.reduce((s, c) => s + c.quantity, 0);
    const oshiFields = oshiCardId != null ? { oshiCardId, oshiImageUrl: oshiImageUrl ?? null } : {};

    if (deckId) {
      await setDoc(
        deckDoc(deckId),
        { name, cardCount, cards, isWip, ...oshiFields, updatedAt: serverTimestamp() },
        { merge: true }
      );
      return deckId;
    }

    const ref = await addDoc(decksCol(), {
      name,
      cardCount,
      cards,
      isWip,
      ...oshiFields,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }

  async function listDecks(): Promise<SavedDeckMeta[]> {
    if (!user) return [];
    const snapshot = await getDocs(query(decksCol(), orderBy("updatedAt", "desc")));
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name as string,
        cardCount: data.cardCount as number,
        isWip: (data.isWip as boolean) ?? false,
        oshiCardId: data.oshiCardId as number | undefined,
        oshiImageUrl: data.oshiImageUrl as string | undefined,
        createdAt: (data.createdAt?.toDate() ?? new Date()) as Date,
        updatedAt: (data.updatedAt?.toDate() ?? new Date()) as Date,
      };
    });
  }

  async function loadDeck(deckId: string): Promise<{ cards: RawDeckCard[]; name: string }> {
    const snapshot = await getDoc(deckDoc(deckId));
    if (!snapshot.exists()) throw new Error("Deck not found");
    const data = snapshot.data();
    return { cards: data.cards as RawDeckCard[], name: data.name as string };
  }

  async function renameDeck(deckId: string, newName: string): Promise<void> {
    await setDoc(
      deckDoc(deckId),
      { name: newName, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }

  async function deleteDeck(deckId: string): Promise<void> {
    await deleteDoc(deckDoc(deckId));
  }

  return { saveDeck, listDecks, loadDeck, renameDeck, deleteDeck, isAuthenticated: !!user };
}
