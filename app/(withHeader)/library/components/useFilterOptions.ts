import { useMemo } from "react";
import type { CardEntry } from "./types";
import { BLOOM_ORDER } from "./types";

export function useFilterOptions(cardEntries: CardEntry[]) {
  const colorOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => card.colors.forEach((c) => s.add(c)));
    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  const typeOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => s.add(card.cardType));
    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  const bloomOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => {
      if (card.bloomLevel) s.add(card.bloomLevel);
    });
    return Array.from(s)
      .sort((a, b) => (BLOOM_ORDER[a] ?? 99) - (BLOOM_ORDER[b] ?? 99))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  const rarityOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => s.add(card.rarity));
    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  const tagOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => card.tags.forEach((t) => s.add(t)));
    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  return { colorOptions, typeOptions, bloomOptions, rarityOptions, tagOptions };
}
