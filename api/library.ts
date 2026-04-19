import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";

export interface LibraryEntry {
  cardId: number;
  quantity: number;
  addedAt: Timestamp;
  updatedAt: Timestamp;
}

function libraryDocRef(uid: string, cardId: number) {
  return doc(db, "users", uid, "library", String(cardId));
}

export async function addCardToLibrary(uid: string, cardId: number): Promise<void> {
  await setDoc(libraryDocRef(uid, cardId), {
    cardId,
    quantity: 1,
    addedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function setCardQuantity(uid: string, cardId: number, quantity: number): void {
  if (quantity <= 0) {
    deleteDoc(libraryDocRef(uid, cardId));
  } else {
    updateDoc(libraryDocRef(uid, cardId), {
      quantity,
      updatedAt: serverTimestamp(),
    });
  }
}
