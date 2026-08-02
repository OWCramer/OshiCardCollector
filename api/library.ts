import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { favoriteCardDocRef } from "@/api/favorites";

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

export interface LibraryIncrement {
  cardId: number;
  /** Amount to ADD to any existing quantity. Must be > 0. */
  quantity: number;
  /** Whether the card is absent from the library, so `addedAt` should be stamped. */
  isNew: boolean;
}

export interface ListMembership {
  listId: string;
  cardId: number;
}

/** Firestore caps a batch at 500 writes; leave headroom. */
const BATCH_LIMIT = 450;

/**
 * Commits a card-importer session: adds each `quantity` to whatever the user
 * already owns, and optionally files the same cards into favorite lists.
 *
 * Quantities use `increment()` so the arithmetic happens server-side — two
 * tabs importing at once both land, and a concurrent edit elsewhere is never
 * clobbered by a read-modify-write.
 *
 * Chunks are individually atomic but not atomic with each other. If a later
 * chunk fails, the caller must NOT clear the draft — but note that a naive
 * retry would double-count the increments that already committed. There is
 * deliberately no automatic retry; the user decides. In practice a session is
 * well under 450 ops, so this is a single batch.
 */
export async function importCardsToLibrary(
  uid: string,
  increments: LibraryIncrement[],
  memberships: ListMembership[] = []
): Promise<void> {
  const ops: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];

  for (const { cardId, quantity, isNew } of increments) {
    if (quantity <= 0) continue;
    ops.push((batch) =>
      batch.set(
        libraryDocRef(uid, cardId),
        {
          cardId,
          quantity: increment(quantity),
          updatedAt: serverTimestamp(),
          // Conditional: an unconditional stamp under `merge` would reset the
          // original acquisition date on every re-import.
          ...(isNew ? { addedAt: serverTimestamp() } : {}),
        },
        // `merge` creates the doc when absent; `increment()` on a missing field
        // sets it to the increment value, so a brand-new card lands exactly.
        { merge: true }
      )
    );
  }

  for (const { listId, cardId } of memberships) {
    ops.push((batch) =>
      batch.set(
        favoriteCardDocRef(uid, listId, cardId),
        { cardId, addedAt: serverTimestamp() },
        { merge: true }
      )
    );
  }

  // Sequential commits, not Promise.all — deterministic failure point and no
  // write burst against the per-second quota.
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const op of ops.slice(i, i + BATCH_LIMIT)) op(batch);
    await batch.commit();
  }
}
