import type { CardMapEntry } from "@/lib/use-card-map";
import type { CardGroup } from "./types";

/** Lowest printing first. Mirrors the table in hooks/useCardFilters.ts. */
export const RARITY_ORDER: Record<string, number> = {
  C: 0,
  U: 1,
  R: 2,
  RR: 3,
  SR: 4,
  HR: 5,
  OSR: 6,
  SEC: 7,
};

/** Lowercase + trim. */
export const norm = (s: string) => s.toLowerCase().trim();

/** Lowercase and strip punctuation, so "hSD01-001" and "hsd01001" compare equal. */
export const bare = (s: string) => norm(s).replace(/[^a-z0-9]/g, "");

/** The collector number after the last dash: "hSD01-001" → "001". */
export const collector = (cardNumber: string) => norm(cardNumber).split("-").at(-1) ?? "";

function comparePrintings(a: CardMapEntry, b: CardMapEntry): number {
  const ra = RARITY_ORDER[a.rarity] ?? 99;
  const rb = RARITY_ORDER[b.rarity] ?? 99;
  if (ra !== rb) return ra - rb;
  const byRarity = a.rarity.localeCompare(b.rarity);
  return byRarity !== 0 ? byRarity : a.id - b.id;
}

/** "Booster Pack – Enchant Regalia" → "Enchant Regalia" */
export function shortSetName(setName: string): string {
  const afterDash = setName
    .split(/\s[–—-]\s/)
    .slice(1)
    .join(" ");
  return (afterDash || setName).trim();
}

/**
 * The set a printing primarily belongs to. 588 cards list more than one — a
 * single physical printing sold in several products — so the first entry is the
 * one that identifies it.
 */
const primarySet = (card: CardMapEntry) => card.setNames?.[0] ?? "";

/**
 * Drops printings whose artwork duplicates another in the same group.
 *
 * `S` is a foil treatment of the base card, not new art. Measured with a
 * perceptual hash over the real catalog: 34 sampled `C`/`S` and `U`/`S` pairs
 * all came back at a difference-hash distance of 0–1, while every other rarity
 * pairing (`R`/`SR`, `OSR`/`OUR`, `C`/`HR`, `OUR`/`SEC`, …) sat at 5–39. All
 * 359 groups containing an `S` have a `C` or `U` sibling, so the foil never
 * ends up being the only thing left.
 *
 * A plain byte checksum does NOT find these — the two files are encoded
 * differently and share no hash, despite being the same picture.
 *
 * This is a rule, not a per-image fingerprint, so a future set that gives `S`
 * genuinely new art would be collapsed incorrectly. That trade buys us not
 * having to fetch and hash ~500MB of card images at build time.
 */
function collapseDuplicateArt(printings: CardMapEntry[]): CardMapEntry[] {
  const hasBase = printings.some((p) => p.rarity === "C" || p.rarity === "U");
  if (!hasBase) return printings;
  const kept = printings.filter((p) => p.rarity !== "S");
  return kept.length > 0 ? kept : printings;
}

export interface CardGroupIndex {
  groups: CardGroup[];
  byKey: Map<string, CardGroup>;
  /** Lets a session row ask "does this card have sibling printings?" in O(1). */
  byCardId: Map<number, CardGroup>;
}

/**
 * Collapses the catalog into one group per card number *per set*. Search runs
 * over these rather than raw cards, so a card printed at four rarities occupies
 * one result row instead of four — while a reprint in a later set stays its own
 * row, because it has its own art and is a genuinely different card to pick.
 */
export function buildCardGroups(cards: CardMapEntry[]): CardGroupIndex {
  const byKey = new Map<string, CardGroup>();

  for (const card of cards) {
    const setName = primarySet(card);
    const key = `${bare(card.cardNumber)}|${bare(setName)}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.printings.push(card);
      continue;
    }
    byKey.set(key, {
      key,
      cardNumber: card.cardNumber,
      name: card.name,
      cardType: card.cardType,
      colors: card.colors ?? [],
      setName: shortSetName(setName),
      printings: [card],
      stackPrintings: [card],
    });
  }

  const byCardId = new Map<number, CardGroup>();
  for (const group of byKey.values()) {
    group.printings.sort(comparePrintings);
    group.stackPrintings = collapseDuplicateArt(group.printings);
    for (const printing of group.printings) byCardId.set(printing.id, group);
  }

  return { groups: [...byKey.values()], byKey, byCardId };
}
