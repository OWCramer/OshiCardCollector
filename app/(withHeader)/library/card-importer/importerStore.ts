import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { queuedKey, resolvedKey, type ImporterEntry, type SortMode } from "./components/types";

export const draftKey = (uid: string | null) => `oshi:importer-draft:${uid ?? "anon"}`;

interface DraftState {
  entries: Record<string, ImporterEntry>;
  seqCounter: number;
  /** Favorite lists the session will also be filed into on save. */
  listIds: string[];
  sortMode: SortMode;
}

const EMPTY_DRAFT: DraftState = { entries: {}, seqCounter: 0, listIds: [], sortMode: "added" };

interface ImporterState extends DraftState {
  uid: string | null;
  status: "idle" | "hydrating" | "ready";
  /** The row to flash. `nonce` lets the same row re-flash on a repeat touch. */
  flash: { key: string; nonce: number } | null;
  nonceCounter: number;

  bindUid: (uid: string | null) => Promise<void>;
  /** Adds a known printing, merging into an existing row for it. */
  addPrinting: (cardId: number, groupKey: string) => void;
  /** Adds a card whose printing is still unanswered. Never merges. */
  queueCard: (groupKey: string) => void;
  /** Answers a queued row, or re-files a resolved one onto another printing. */
  assignPrinting: (entryKey: string, cardId: number) => void;
  adjustQuantity: (entryKey: string, delta: number) => void;
  setQuantity: (entryKey: string, quantity: number) => void;
  removeEntry: (entryKey: string) => void;
  setListIds: (listIds: string[]) => void;
  setSortMode: (sortMode: SortMode) => void;
  discard: () => void;
  clearAfterSave: () => void;
}

/** Drops an entry without mutating the original record. */
function without(entries: Record<string, ImporterEntry>, key: string) {
  const next = { ...entries };
  delete next[key];
  return next;
}

export const useImporterStore = create<ImporterState>()(
  persist(
    (set, get) => ({
      ...EMPTY_DRAFT,
      uid: null,
      status: "idle",
      flash: null,
      nonceCounter: 0,

      /**
       * Points persist at this user's key and loads their draft.
       *
       * The ordering is the whole trick: the `set` below lands on the PREVIOUS
       * user's key (correct — that's whose draft is still in memory), then
       * `setOptions` switches keys, then we read storage ourselves rather than
       * trusting `rehydrate()`, which leaves stale in-memory state when the new
       * key is empty — so user A's draft would surface under, and then be
       * persisted to, user B's key.
       */
      async bindUid(uid) {
        if (get().uid === uid && get().status === "ready") return;
        set({ uid, status: "hydrating", flash: null });

        const key = draftKey(uid);
        useImporterStore.persist.setOptions({ name: key });

        const stored = typeof window === "undefined" ? null : window.localStorage.getItem(key);
        if (stored) {
          await useImporterStore.persist.rehydrate();
        } else {
          // The key is already empty, so the resulting write-back is a no-op.
          set({ ...EMPTY_DRAFT });
        }
        set({ status: "ready" });
      },

      addPrinting(cardId, groupKey) {
        set((s) => {
          const seq = s.seqCounter + 1;
          const nonce = s.nonceCounter + 1;
          const key = resolvedKey(cardId);
          const existing = s.entries[key];
          return {
            seqCounter: seq,
            nonceCounter: nonce,
            entries: {
              ...s.entries,
              [key]: {
                key,
                cardId,
                groupKey,
                quantity: (existing?.quantity ?? 0) + 1,
                seq,
              },
            },
            flash: { key, nonce },
          };
        });
      },

      queueCard(groupKey) {
        set((s) => {
          const seq = s.seqCounter + 1;
          const nonce = s.nonceCounter + 1;
          // Keyed off seq so every keystroke gets its own row — two copies of
          // one card number can wait on different rarities side by side.
          const key = queuedKey(seq);
          return {
            seqCounter: seq,
            nonceCounter: nonce,
            entries: { ...s.entries, [key]: { key, cardId: null, groupKey, quantity: 1, seq } },
            flash: { key, nonce },
          };
        });
      },

      assignPrinting(entryKey, cardId) {
        set((s) => {
          const from = s.entries[entryKey];
          const toKey = resolvedKey(cardId);
          if (!from || from.key === toKey) return {};

          const entries = without(s.entries, entryKey);
          const existing = entries[toKey];
          const merging = existing !== undefined;

          entries[toKey] = merging
            ? // A merge means this card just gained copies, which is an add —
              // so it surfaces at the top like any other add.
              { ...existing, quantity: existing.quantity + from.quantity, seq: s.seqCounter + 1 }
            : // A plain resolve keeps `seq`, so answering a queue top to bottom
              // doesn't reshuffle the rows still waiting below it.
              { ...from, key: toKey, cardId };

          return {
            entries,
            seqCounter: merging ? s.seqCounter + 1 : s.seqCounter,
            nonceCounter: s.nonceCounter + 1,
            flash: { key: toKey, nonce: s.nonceCounter + 1 },
          };
        });
      },

      adjustQuantity(entryKey, delta) {
        const existing = get().entries[entryKey];
        if (!existing) return;
        get().setQuantity(entryKey, existing.quantity + delta);
      },

      setQuantity(entryKey, quantity) {
        set((s) => {
          const existing = s.entries[entryKey];
          if (!existing) return {};
          if (quantity <= 0) return { entries: without(s.entries, entryKey) };
          return { entries: { ...s.entries, [entryKey]: { ...existing, quantity } } };
        });
      },

      removeEntry(entryKey) {
        set((s) => ({ entries: without(s.entries, entryKey) }));
      },

      setListIds(listIds) {
        set({ listIds });
      },

      setSortMode(sortMode) {
        set({ sortMode });
      },

      // Keeps listIds and sortMode — those are preferences, not session data.
      discard() {
        set({ entries: {}, seqCounter: 0, flash: null });
      },

      clearAfterSave() {
        set({ entries: {}, seqCounter: 0, flash: null });
      },
    }),
    {
      name: draftKey(null), // replaced by bindUid once auth resolves
      // v2 introduced queued (printing-unanswered) entries, re-keying `entries`
      // from card id to a string key. v3 folded the set into `groupKey`, so v2
      // group keys no longer resolve against the catalog index.
      version: 3,
      storage: createJSONStorage(() => localStorage),
      // Without this, persist reads localStorage during store creation — which
      // runs during the server prerender of this client component, so the first
      // client render would disagree with the server HTML.
      skipHydration: true,
      // Top-level keys only, so persist's default shallow merge is correct —
      // a v2 blob without `sortMode` simply keeps the initial default.
      partialize: (s): DraftState => ({
        entries: s.entries,
        seqCounter: s.seqCounter,
        listIds: s.listIds,
        sortMode: s.sortMode,
      }),
      // A lost draft is a far smaller failure than a corrupt one.
      migrate: (persisted, version) => (version === 3 ? persisted : EMPTY_DRAFT),
      // persist's default merge fills gaps from LIVE state, which on an account
      // switch is the previous user's. Any field the stored blob is missing —
      // e.g. `sortMode` in a draft written before it existed — would silently
      // carry over. Reset through EMPTY_DRAFT so absent means default, not
      // "whatever the last user had".
      merge: (persisted, current) => ({
        ...current,
        ...EMPTY_DRAFT,
        ...(persisted as Partial<DraftState>),
      }),
    }
  )
);
