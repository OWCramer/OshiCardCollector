import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";

export interface FavoriteList {
  id: string;
  name: string;
  createdAt: Timestamp;
}

export interface FavoriteEntry {
  cardId: number;
  addedAt: Timestamp;
}

function listColRef(uid: string) {
  return collection(db, "users", uid, "favoriteLists");
}

function listDocRef(uid: string, listId: string) {
  return doc(db, "users", uid, "favoriteLists", listId);
}

function cardDocRef(uid: string, listId: string, cardId: number) {
  return doc(db, "users", uid, "favoriteLists", listId, "cards", String(cardId));
}

export async function createFavoriteList(uid: string, name: string): Promise<string> {
  const ref = await addDoc(listColRef(uid), {
    name,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteFavoriteList(uid: string, listId: string, cardIds: number[]): Promise<void> {
  // Firestore doesn't auto-delete subcollections — remove card docs first.
  await Promise.all(cardIds.map((id) => deleteDoc(cardDocRef(uid, listId, id))));
  await deleteDoc(listDocRef(uid, listId));
}

export async function renameFavoriteList(uid: string, listId: string, name: string): Promise<void> {
  await updateDoc(listDocRef(uid, listId), { name });
}

export async function addCardToList(uid: string, listId: string, cardId: number): Promise<void> {
  await setDoc(cardDocRef(uid, listId, cardId), {
    cardId,
    addedAt: serverTimestamp(),
  });
}

export async function removeCardFromList(uid: string, listId: string, cardId: number): Promise<void> {
  await deleteDoc(cardDocRef(uid, listId, cardId));
}
