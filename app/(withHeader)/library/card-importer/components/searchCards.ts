import { bare, collector, norm } from "./cardGroups";
import type { CardGroup, SearchHit } from "./types";

/**
 * A deliberately non-fuzzy, tiered scorer.
 *
 * Enter commits the top hit straight into the user's collection, so a near-miss
 * is a correctness bug, not a cosmetic one — fuse.js at the threshold used
 * elsewhere in this repo happily matches "hSD01" against "hBP01". The ranking is
 * also a specified ladder rather than a continuous distance, which an
 * edit-distance search can't express anyway.
 *
 * Returns the highest matching tier, or 0 for no match.
 */
export function scoreGroup(group: CardGroup, query: string, queryBare: string): number {
  const q = norm(query);
  const number = norm(group.cardNumber);
  const numberBare = bare(group.cardNumber);
  const name = norm(group.name);

  if (number === q) return 100;
  if (numberBare === queryBare) return 98;
  if (numberBare.startsWith(queryBare)) return 90;
  // Guarded on length so "01" doesn't match every collector number in the game.
  if (q.length >= 3 && collector(group.cardNumber).startsWith(queryBare)) return 80;
  if (name.startsWith(q)) return 70;
  if (name.includes(q)) return 55;
  if (norm(group.cardType).includes(q)) return 20;
  return 0;
}

export function searchGroups(groups: CardGroup[], query: string, limit = 5): SearchHit[] {
  const q = norm(query);
  if (!q) return [];
  const queryBare = bare(query);
  if (!queryBare) return [];

  const hits: SearchHit[] = [];
  for (const group of groups) {
    const score = scoreGroup(group, q, queryBare);
    if (score > 0) hits.push({ group, score });
  }

  // Set breaks the tie, because one card number now yields one row per set and
  // those would otherwise land in whatever order the catalog happened to be in.
  hits.sort(
    (a, b) =>
      b.score - a.score ||
      a.group.cardNumber.localeCompare(b.group.cardNumber) ||
      a.group.setName.localeCompare(b.group.setName)
  );
  return hits.slice(0, limit);
}
