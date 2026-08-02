import type { CardMapEntry } from "@/lib/use-card-map";

/**
 * One line of the import session.
 *
 * A card whose number has several printings is added *unresolved* — `cardId`
 * stays null until you answer the rarity question. That keeps the search field
 * free, so a whole pack can be queued first and the printings answered after.
 *
 * Identity is the `key`, not the card id, because two copies of the same card
 * number can sit in the queue at once awaiting different rarities:
 *   - resolved → `c:{cardId}`, so re-adding a printing merges into one row
 *   - queued   → `p:{seq}`, unique per keystroke, never merges
 *
 * Persisted verbatim, so it holds no card display data — that is joined from
 * `useCardMap()` at render time and can never go stale in storage.
 */
export interface ImporterEntry {
  key: string;
  /** Null while the printing is still unanswered. */
  cardId: number | null;
  /** Normalized card number — known even before the printing is. */
  groupKey: string;
  quantity: number;
  /** Monotonic; higher = more recently added = higher in the ledger. */
  seq: number;
}

export const resolvedKey = (cardId: number) => `c:${cardId}`;
export const queuedKey = (seq: number) => `p:${seq}`;

/**
 * The printings of one card number *within one set* — e.g. the U and S of
 * hBP02-085 in Quintet Spectrum, with its Enchant Regalia reprint forming a
 * second group.
 *
 * Set is part of the identity because a reprint has different art, so it is a
 * different thing to pick off a search result, not a rarity variant.
 */
export interface CardGroup {
  /** Normalized card number + set — the group's identity. */
  key: string;
  cardNumber: string;
  name: string;
  cardType: string;
  colors: string[];
  /** Display form, with the "Booster Pack – " style prefix stripped. */
  setName: string;
  /** Sorted lowest rarity first; index 0 is the default printing. */
  printings: CardMapEntry[];
  /**
   * `printings` with visually duplicate artwork collapsed — what the card stack
   * cycles through. Always a non-empty subset; never use it for the rarity
   * picker, which must offer every real printing.
   */
  stackPrintings: CardMapEntry[];
}

export interface SearchHit {
  group: CardGroup;
  score: number;
}

/** An entry joined with its catalog data, ready to render. */
export interface LedgerRow {
  entry: ImporterEntry;
  /** The chosen printing. Undefined while queued, or if the catalog lost it. */
  card: CardMapEntry | undefined;
  group: CardGroup | undefined;
  /** True for the one queued row that number keys will answer. */
  isActiveQuestion: boolean;
}

export type Density = "compact" | "touch";

export type SortMode = "added" | "rarity" | "set" | "id";
