"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { importCardsToLibrary, type LibraryIncrement, type ListMembership } from "@/api/library";
import { useAuth } from "@/lib/auth-context";
import { useLibrary } from "@/lib/library-context";
import { useFavorites } from "@/lib/favorites-context";
import { useImporterStore } from "../importerStore";

const SAVED_NOTE_MS = 2600;

export interface SaveSession {
  save: () => Promise<void>;
  saving: boolean;
  /** Non-null while the green "✓ saved" note is showing. */
  savedAt: number | null;
  error: string | null;
}

export function useSaveSession(): SaveSession {
  const { user } = useAuth();
  const { library } = useLibrary();
  const { isInList } = useFavorites();

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const save = useCallback(async () => {
    const { entries, listIds, clearAfterSave } = useImporterStore.getState();
    const rows = Object.values(entries);
    if (!user || rows.length === 0 || saving) return;

    // Belt and braces — the Save button is already disabled in this state, but
    // a row with no rarity chosen has no card id and must never reach Firestore.
    if (rows.some((entry) => entry.cardId === null)) {
      setError("Some cards still need a rarity.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Several rows can resolve to the same printing (two queued copies both
      // answered "RR"), so fold by card id before writing.
      const byCardId = new Map<number, number>();
      for (const entry of rows) {
        const cardId = entry.cardId as number;
        byCardId.set(cardId, (byCardId.get(cardId) ?? 0) + entry.quantity);
      }

      const increments: LibraryIncrement[] = [...byCardId].map(([cardId, quantity]) => ({
        cardId,
        quantity,
        isNew: !library[cardId],
      }));

      // Skip memberships that already exist so their addedAt survives.
      const memberships: ListMembership[] = listIds.flatMap((listId) =>
        [...byCardId.keys()]
          .filter((cardId) => !isInList(listId, cardId))
          .map((cardId) => ({ listId, cardId }))
      );

      await importCardsToLibrary(user.uid, increments, memberships);

      clearAfterSave();
      setSavedAt(Date.now());
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSavedAt(null), SAVED_NOTE_MS);
    } catch (e) {
      // Leave the draft intact so the user can retry deliberately.
      setError(e instanceof Error ? e.message : "Could not save to your library.");
    } finally {
      setSaving(false);
    }
  }, [user, library, isInList, saving]);

  return { save, saving, savedAt, error };
}
