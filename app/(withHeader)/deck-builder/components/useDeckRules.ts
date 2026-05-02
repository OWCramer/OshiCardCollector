import { useMemo } from "react";
import { type DeckEntry } from "./DeckPreview";
import { type FullCardEntry } from "./CardLibrary";

export const DECK_LIMITS = {
  oshi: 1,
  main: 30,   // holomem + support combined
  cheer: 20,
  total: 51,  // oshi + main + cheer
  perCard: 4,
} as const;

const UNLIMITED_TEXT = "You may include any number of this holomem in the deck";

export function maxForCard(card: FullCardEntry): number {
  if (card.cardType === "OSHI") return DECK_LIMITS.oshi;
  if (card.cardType === "CHEER") return Infinity; // no per-card limit for cheer
  if (card.extraText?.includes(UNLIMITED_TEXT)) return Infinity;
  return DECK_LIMITS.perCard;
}

export interface DeckStats {
  oshiEntry: DeckEntry | undefined;
  holomem: number;
  cheer: number;
  support: number;
  main: number;   // holomem + support
  total: number;  // everything
}

export function useDeckRules(deck: DeckEntry[]) {
  const stats = useMemo<DeckStats>(() => {
    const oshiEntry = deck.find((e) => e.card.cardType === "OSHI");
    const holomem = deck
      .filter((e) => e.card.cardType === "HOLOMEM")
      .reduce((s, e) => s + e.quantity, 0);
    const cheer = deck
      .filter((e) => e.card.cardType === "CHEER")
      .reduce((s, e) => s + e.quantity, 0);
    const support = deck
      .filter((e) => e.card.cardType === "SUPPORT")
      .reduce((s, e) => s + e.quantity, 0);
    const main = holomem + support;
    const total = main + cheer + (oshiEntry ? 1 : 0);
    return { oshiEntry, holomem, cheer, support, main, total };
  }, [deck]);

  function isAtLimit(card: FullCardEntry): boolean {
    const existing = deck.find((e) => e.card.id === card.id);
    const qty = existing?.quantity ?? 0;

    // Per-card limit (oshi = 1, cheer = ∞, holomem/support = 4 unless unlimited)
    if (qty >= maxForCard(card)) return true;

    // Only one oshi allowed — block all oshi cards once any is in the deck
    if (card.cardType === "OSHI" && stats.oshiEntry) return true;

    // Main deck slots exhausted — block all holomem & support
    if (
      (card.cardType === "HOLOMEM" || card.cardType === "SUPPORT") &&
      stats.main >= DECK_LIMITS.main
    ) return true;

    // Cheer slots exhausted
    if (card.cardType === "CHEER" && stats.cheer >= DECK_LIMITS.cheer) return true;

    return false;
  }

  return { stats, isAtLimit };
}

// ── Autofill cheer ─────────────────────────────────────────────────────────────

/**
 * Looks at every art cost in the deck and returns how many of each color
 * cheer card to add so the total reaches DECK_LIMITS.cheer (20).
 * Colorless-only decks fall back to WHITE.
 */
export function calculateCheerDistribution(deck: DeckEntry[]): Record<string, number> {
  const colorCount: Record<string, number> = {};

  for (const entry of deck) {
    if (entry.card.cardType === "CHEER" || entry.card.cardType === "OSHI") continue;
    for (const art of entry.card.arts) {
      for (const color of art.cost ?? []) {
        if (color !== "COLORLESS") {
          colorCount[color] = (colorCount[color] ?? 0) + entry.quantity;
        }
      }
    }
  }

  const target = DECK_LIMITS.cheer;
  const colors = Object.keys(colorCount);

  if (colors.length === 0) return { WHITE: target };

  const total = Object.values(colorCount).reduce((s, v) => s + v, 0);
  const result: Record<string, number> = {};
  let assigned = 0;

  const sorted = [...colors].sort((a, b) => (colorCount[b] ?? 0) - (colorCount[a] ?? 0));

  for (let i = 0; i < sorted.length; i++) {
    const color = sorted[i];
    if (i === sorted.length - 1) {
      result[color] = target - assigned;
    } else {
      const share = Math.round((colorCount[color] / total) * target);
      result[color] = Math.max(0, share);
      assigned += result[color];
    }
  }

  return result;
}
