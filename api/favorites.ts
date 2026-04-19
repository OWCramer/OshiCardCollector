import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";

export interface FavoriteEntry {
  cardId: number;
  addedAt: Timestamp;
}

function favoriteDocRef(uid: string, cardId: number) {
  return doc(db, "users", uid, "favorites", String(cardId));
}

export async function addFavorite(uid: string, cardId: number): Promise<void> {
  await setDoc(favoriteDocRef(uid, cardId), {
    cardId,
    addedAt: serverTimestamp(),
  });
}

export async function removeFavorite(uid: string, cardId: number): Promise<void> {
  await deleteDoc(favoriteDocRef(uid, cardId));
}
