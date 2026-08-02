import { bare, collector, norm } from "./cardGroups";
import type { CardGroup, SearchHit } from "./types";

/**
 * How strongly the current session pulls a result up the list.
 *
 * Both maps are derived from what you've already added, so ripping a box keeps
 * surfacing the cards and the set you're actually working through.
 */
export interface SessionAffinity {
  /** Cards already in the session, keyed by group. */
  countByGroup: Map<string, number>;
  /** Share of the session's cards that came from each set, 0–1. */
  shareBySet: Map<string, number>;
}

export const EMPTY_AFFINITY: SessionAffinity = {
  countByGroup: new Map(),
  shareBySet: new Map(),
};

/**
 * Shorter queries match most of the catalog — a single letter hits 800+ of the
 * 1011 groups — so searching doesn't begin until there's something to go on.
 */
export const MIN_QUERY_LENGTH = 3;

/**
 * A deliberately non-fuzzy, tiered scorer.
 *
 * Enter commits the top hit straight into the user's collection, so a near-miss
 * is a correctness bug, not a cosmetic one. Card numbers in particular must
 * never be matched fuzzily: they all share the `hXXNN-NNN` shape, so every one
 * is ~80% similar to every other and a fuzzy pass over that field returns most
 * of the catalog for any query.
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
  if (numberBare.startsWith(queryBare)) return 92;
  // "098" — the collector number on its own.
  if (collector(group.cardNumber).startsWith(queryBare)) return 86;
  // "01-098" — a fragment from the middle, which none of the anchored tiers
  // above can reach.
  if (numberBare.includes(queryBare)) return 80;
  if (name.startsWith(q)) return 70;
  if (name.includes(q)) return 55;
  if (norm(group.cardType).includes(q)) return 20;
  return 0;
}

/**
 * Every match, unranked by count — the caller decides how many to show.
 *
 * Relevance still leads: an exact card number outranks anything the session
 * prefers, or typing a full code would stop being reliable. Affinity breaks
 * ties *within* a tier, which is where it matters — searching a card name
 * matches a dozen groups at equal relevance, and the one you've already pulled
 * five of should be first.
 */
export function searchGroups(
  groups: CardGroup[],
  query: string,
  affinity: SessionAffinity = EMPTY_AFFINITY
): SearchHit[] {
  const q = norm(query);
  const queryBare = bare(query);
  // The length floor is what makes an uncapped result set safe: below it a
  // single letter would match most of the catalog.
  if (q.length < MIN_QUERY_LENGTH || !queryBare) return [];

  const hits: SearchHit[] = [];
  for (const group of groups) {
    const score = scoreGroup(group, q, queryBare);
    if (score > 0) hits.push({ group, score });
  }

  const added = (g: CardGroup) => affinity.countByGroup.get(g.key) ?? 0;
  const setShare = (g: CardGroup) => affinity.shareBySet.get(g.setName) ?? 0;

  hits.sort(
    (a, b) =>
      b.score - a.score ||
      // Copies already added outrank set affinity, per the brief.
      added(b.group) - added(a.group) ||
      setShare(b.group) - setShare(a.group) ||
      a.group.cardNumber.localeCompare(b.group.cardNumber) ||
      a.group.setName.localeCompare(b.group.setName)
  );
  return hits;
}
