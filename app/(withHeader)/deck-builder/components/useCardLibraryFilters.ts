import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { BLOOM_ORDER, COLOR_ORDER, TYPE_ORDER } from "./cardOrdering";

export type SortField =
  | "name"
  | "releaseDate"
  | "rarity"
  | "cardNumber"
  | "color"
  | "bloomLevel"
  | "type";
export type SortOrder = "asc" | "desc";

type Card = {
  id: number;
  name: string;
  cardNumber: string;
  rarity: string;
  cardType: string;
  colors: string[];
  bloomLevel?: string | null;
  releaseDate?: string | null;
  supportType?: string | null;
  tags: string[];
  specialText?: string | null;
  extraText?: string | null;
};

const RARITY_ORDER: Record<string, number> = {
  C: 0,
  U: 1,
  R: 2,
  RR: 3,
  SR: 4,
  HR: 5,
  OSR: 6,
  SEC: 7,
};

export const SORT_ITEMS: { value: SortField; label: string }[] = [
  { value: "releaseDate", label: "Release Date" },
  { value: "name", label: "Name" },
  { value: "rarity", label: "Rarity" },
  { value: "cardNumber", label: "Card #" },
  { value: "color", label: "Color" },
  { value: "bloomLevel", label: "Bloom Level" },
  { value: "type", label: "Type" },
];

function sortCards<T extends Card>(cards: T[], field: SortField, order: SortOrder): T[] {
  return [...cards].sort((a, b) => {
    let r = 0;
    switch (field) {
      case "name":
        r = a.name.localeCompare(b.name);
        break;
      case "releaseDate":
        r = (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "");
        break;
      case "rarity": {
        const ra = RARITY_ORDER[a.rarity] ?? 99;
        const rb = RARITY_ORDER[b.rarity] ?? 99;
        r = ra !== rb ? ra - rb : a.rarity.localeCompare(b.rarity);
        break;
      }
      case "cardNumber":
        r = a.cardNumber.localeCompare(b.cardNumber);
        break;
      case "color": {
        const ca = COLOR_ORDER[a.colors[0]] ?? 99;
        const cb = COLOR_ORDER[b.colors[0]] ?? 99;
        r = ca !== cb ? ca - cb : a.name.localeCompare(b.name);
        break;
      }
      case "bloomLevel": {
        const ba = BLOOM_ORDER[a.bloomLevel ?? ""] ?? 99;
        const bb = BLOOM_ORDER[b.bloomLevel ?? ""] ?? 99;
        r = ba !== bb ? ba - bb : a.name.localeCompare(b.name);
        break;
      }
      case "type": {
        const ta = TYPE_ORDER[a.cardType] ?? 99;
        const tb = TYPE_ORDER[b.cardType] ?? 99;
        r = ta !== tb ? ta - tb : a.name.localeCompare(b.name);
        break;
      }
    }
    return order === "asc" ? r : -r;
  });
}

export function useCardLibraryFilters<T extends Card>(cards: T[]) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("releaseDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [colorFilter, setColorFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [bloomFilter, setBloomFilter] = useState<string[]>([]);
  const [rarityFilter, setRarityFilter] = useState<string[]>([]);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [supportTypeFilter, setSupportTypeFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = useMemo(
    () => ({
      colorOptions: [...new Set(cards.flatMap((c) => c.colors))]
        .sort()
        .map((v) => ({ value: v, label: v })),
      typeOptions: [...new Set(cards.map((c) => c.cardType))].map((v) => ({ value: v, label: v })),
      bloomOptions: [...new Set(cards.map((c) => c.bloomLevel).filter(Boolean) as string[])].map(
        (v) => ({ value: v, label: v })
      ),
      rarityOptions: [...new Set(cards.map((c) => c.rarity))].map((v) => ({ value: v, label: v })),
      tagOptions: [...new Set(cards.flatMap((c) => c.tags))]
        .sort()
        .map((v) => ({ value: v, label: v })),
      supportTypeOptions: [
        ...new Set(cards.map((c) => c.supportType).filter(Boolean) as string[]),
      ].map((v) => ({ value: v, label: v })),
    }),
    [cards]
  );

  const hasActiveFilters =
    colorFilter.length > 0 ||
    typeFilter.length > 0 ||
    bloomFilter.length > 0 ||
    rarityFilter.length > 0 ||
    tagsFilter.length > 0 ||
    supportTypeFilter.length > 0;

  const fuse = useMemo(
    () =>
      new Fuse(cards, {
        keys: ["name", "cardNumber", "tags", "specialText", "extraText"],
        threshold: 0.35,
        ignoreLocation: true,
        ignoreDiacritics: true,
        shouldSort: false,
        useExtendedSearch: true,
      }),
    [cards]
  );

  const displayCards = useMemo(() => {
    let result = search.trim() ? fuse.search(search).map((r) => r.item) : cards;
    if (colorFilter.length)
      result = result.filter((c) => c.colors.some((col) => colorFilter.includes(col)));
    if (typeFilter.length) result = result.filter((c) => typeFilter.includes(c.cardType));
    if (bloomFilter.length)
      result = result.filter((c) => c.bloomLevel != null && bloomFilter.includes(c.bloomLevel));
    if (rarityFilter.length) result = result.filter((c) => rarityFilter.includes(c.rarity));
    if (tagsFilter.length)
      result = result.filter((c) => tagsFilter.some((t) => c.tags.includes(t)));
    if (supportTypeFilter.length)
      result = result.filter(
        (c) => c.supportType != null && supportTypeFilter.includes(c.supportType)
      );
    return sortCards(result, sortField, sortOrder);
  }, [
    search,
    fuse,
    cards,
    colorFilter,
    typeFilter,
    bloomFilter,
    rarityFilter,
    tagsFilter,
    supportTypeFilter,
    sortField,
    sortOrder,
  ]);

  function clearFilters() {
    setColorFilter([]);
    setTypeFilter([]);
    setBloomFilter([]);
    setRarityFilter([]);
    setTagsFilter([]);
    setSupportTypeFilter([]);
  }

  return {
    displayCards,
    search,
    setSearch,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    colorFilter,
    setColorFilter,
    typeFilter,
    setTypeFilter,
    bloomFilter,
    setBloomFilter,
    rarityFilter,
    setRarityFilter,
    tagsFilter,
    setTagsFilter,
    supportTypeFilter,
    setSupportTypeFilter,
    filterOptions,
    hasActiveFilters,
    clearFilters,
    showFilters,
    setShowFilters,
  };
}
