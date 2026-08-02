import type { DropdownItem } from "@/components/Dropdown";
import { RARITY_ORDER } from "./cardGroups";
import type { LedgerRow, SortMode } from "./types";

export const SORT_ITEMS: DropdownItem<SortMode>[] = [
  { value: "added", label: "Order added" },
  { value: "rarity", label: "Rarity" },
  { value: "set", label: "Set" },
  { value: "id", label: "ID" },
];

/** Newest first — the design's "the row jumping to the top is the receipt". */
const byAdded = (a: LedgerRow, b: LedgerRow) => b.entry.seq - a.entry.seq;

const cardNumber = (r: LedgerRow) => r.group?.cardNumber ?? r.card?.cardNumber ?? "";
const setName = (r: LedgerRow) => r.group?.setName ?? r.card?.setNames?.[0] ?? "";

const COMPARATORS: Record<SortMode, (a: LedgerRow, b: LedgerRow) => number> = {
  added: byAdded,
  rarity: (a, b) => {
    const ra = RARITY_ORDER[a.card?.rarity ?? ""] ?? 99;
    const rb = RARITY_ORDER[b.card?.rarity ?? ""] ?? 99;
    return ra - rb || cardNumber(a).localeCompare(cardNumber(b));
  },
  set: (a, b) => setName(a).localeCompare(setName(b)) || cardNumber(a).localeCompare(cardNumber(b)),
  id: (a, b) => (a.card?.id ?? 0) - (b.card?.id ?? 0),
};

/**
 * Sorts the ledger, always pinning rows that still need a printing to the top.
 *
 * The pin is load-bearing, not cosmetic: number keys answer the topmost
 * unanswered row, so letting a sort bury the queue would break that flow. Among
 * themselves the unanswered rows stay in the order they were added, which is
 * what makes "tap 1, 2, 2" work no matter which sort is active.
 */
export function sortRows(rows: LedgerRow[], mode: SortMode): LedgerRow[] {
  const queued = rows.filter((r) => r.entry.cardId === null).sort(byAdded);
  const resolved = rows.filter((r) => r.entry.cardId !== null).sort(COMPARATORS[mode]);
  return [...queued, ...resolved];
}
