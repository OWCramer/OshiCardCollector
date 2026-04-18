"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { CardType, type GetAllCardsQuery } from "@/generated/graphql";

export type CardNode = NonNullable<GetAllCardsQuery["cards"]["nodes"][number]>;

export type SortField =
  | "name"
  | "cardNumber"
  | "colors"
  | "rarity"
  | "hp"
  | "bloomLevel"
  | "releaseDate";

export type SortOrder = "asc" | "desc";

// Custom sort orders
const BLOOM_ORDER: Record<string, number> = {
  Spot: 0,
  Debut: 1,
  "1st": 2,
  "2nd": 3,
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

// ─── helpers ────────────────────────────────────────────────────────────────

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  return isNaN(n) ? undefined : n;
}

function comparator(a: CardNode, b: CardNode, field: SortField, order: SortOrder): number {
  let result = 0;

  switch (field) {
    case "name":
      result = a.name.localeCompare(b.name);
      break;
    case "cardNumber":
      result = a.cardNumber.localeCompare(b.cardNumber);
      break;
    case "colors":
      result = (a.colors[0] ?? "").localeCompare(b.colors[0] ?? "");
      break;
    case "rarity": {
      const ra = RARITY_ORDER[a.rarity] ?? 99;
      const rb = RARITY_ORDER[b.rarity] ?? 99;
      result = ra !== rb ? ra - rb : a.rarity.localeCompare(b.rarity);
      break;
    }
    case "hp": {
      const ha = a.hp ?? -1;
      const hb = b.hp ?? -1;
      result = ha - hb;
      break;
    }
    case "bloomLevel": {
      const ba = a.bloomLevel != null ? (BLOOM_ORDER[a.bloomLevel] ?? 99) : 99;
      const bb = b.bloomLevel != null ? (BLOOM_ORDER[b.bloomLevel] ?? 99) : 99;
      result = ba - bb;
      break;
    }
    case "releaseDate": {
      const da = a.releaseDate;
      const db = b.releaseDate;
      if (!da && !db) result = 0;
      else if (!da) result = 1;
      else if (!db) result = -1;
      else result = da.localeCompare(db);
      break;
    }
  }

  return order === "asc" ? result : -result;
}

// ─── hook ────────────────────────────────────────────────────────────────────

export function useCardFilters(allCards: CardNode[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── read params ──────────────────────────────────────────────────────────
  const search = searchParams.get("search") ?? "";
  const rarityFilter = parseList(searchParams.get("rarity"));
  const cardTypeFilter = parseList(searchParams.get("cardType"));
  const colorsFilter = parseList(searchParams.get("colors"));
  const bloomLevelFilter = parseList(searchParams.get("bloomLevel"));
  const setsFilter = parseList(searchParams.get("sets"));
  const tagsFilter = parseList(searchParams.get("tags"));
  const isLimitedFilter = searchParams.get("isLimited") === "true" ? true : null;
  const isBuzzFilter = searchParams.get("isBuzz") === "true" ? true : null;
  const minHp = parseNumber(searchParams.get("minHp"));
  const maxHp = parseNumber(searchParams.get("maxHp"));
  const sortField = (searchParams.get("sortField") as SortField | null) ?? "releaseDate";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder | null) ?? "asc";

  // ── setters ──────────────────────────────────────────────────────────────
  function setParam(updates: Record<string, string | string[] | boolean | number | null | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, String(value));
      }
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const setSearch = (v: string) => setParam({ search: v });
  const setRarityFilter = (v: string[]) => setParam({ rarity: v });
  const setCardTypeFilter = (v: string[]) => setParam({ cardType: v });
  const setColorsFilter = (v: string[]) => setParam({ colors: v });
  const setBloomLevelFilter = (v: string[]) => setParam({ bloomLevel: v });
  const setSetsFilter = (v: string[]) => setParam({ sets: v });
  const setTagsFilter = (v: string[]) => setParam({ tags: v });
  const setIsLimitedFilter = (v: boolean | null) => setParam({ isLimited: v === true ? "true" : null });
  const setIsBuzzFilter = (v: boolean | null) => setParam({ isBuzz: v === true ? "true" : null });
  const setMinHp = (v: number | undefined) => setParam({ minHp: v ?? null });
  const setMaxHp = (v: number | undefined) => setParam({ maxHp: v ?? null });
  const setSortField = (v: SortField) => setParam({ sortField: v });
  const setSortOrder = (v: SortOrder) => setParam({ sortOrder: v });

  const hasActiveFilters =
    !!search ||
    rarityFilter.length > 0 ||
    cardTypeFilter.length > 0 ||
    colorsFilter.length > 0 ||
    bloomLevelFilter.length > 0 ||
    setsFilter.length > 0 ||
    tagsFilter.length > 0 ||
    isLimitedFilter !== null ||
    isBuzzFilter !== null ||
    minHp !== undefined ||
    maxHp !== undefined;

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of [
      "search", "rarity", "cardType", "colors", "bloomLevel",
      "sets", "tags", "isLimited", "isBuzz", "minHp", "maxHp",
    ]) {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // ── fuzzy search ─────────────────────────────────────────────────────────
  const fuse = useMemo(
    () => new Fuse(allCards, { keys: ["name", "setNames", "tags"], threshold: 0.3 }),
    [allCards]
  );

  const afterSearch = useMemo(() => {
    if (!search.trim()) return allCards;
    return fuse.search(search).map((r) => r.item);
  }, [fuse, search, allCards]);

  // ── filter ───────────────────────────────────────────────────────────────
  const afterFilter = useMemo(() => {
    return afterSearch.filter((card) => {
      if (rarityFilter.length > 0 && !rarityFilter.includes(card.rarity)) return false;
      if (cardTypeFilter.length > 0 && !cardTypeFilter.includes(card.cardType)) return false;
      if (colorsFilter.length > 0 && !card.colors.some((c) => colorsFilter.includes(c))) return false;
      if (bloomLevelFilter.length > 0) {
        if (!card.bloomLevel || !bloomLevelFilter.includes(card.bloomLevel)) return false;
      }
      if (setsFilter.length > 0 && !setsFilter.some((s) => card.setNames.includes(s))) return false;
      if (tagsFilter.length > 0 && !tagsFilter.some((t) => card.tags.includes(t))) return false;
      if (isLimitedFilter === true && !card.isLimited) return false;
      if (isBuzzFilter === true && !card.isBuzz) return false;
      if (minHp !== undefined && (card.hp == null || card.hp < minHp)) return false;
      if (maxHp !== undefined && (card.hp == null || card.hp > maxHp)) return false;
      return true;
    });
  }, [
    afterSearch,
    rarityFilter,
    cardTypeFilter,
    colorsFilter,
    bloomLevelFilter,
    setsFilter,
    tagsFilter,
    isLimitedFilter,
    isBuzzFilter,
    minHp,
    maxHp,
  ]);

  // ── sort ─────────────────────────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    return [...afterFilter].sort((a, b) => comparator(a, b, sortField, sortOrder));
  }, [afterFilter, sortField, sortOrder]);

  return {
    // values
    search,
    rarityFilter,
    cardTypeFilter,
    colorsFilter,
    bloomLevelFilter,
    setsFilter,
    tagsFilter,
    isLimitedFilter,
    isBuzzFilter,
    minHp,
    maxHp,
    sortField,
    sortOrder,
    // setters
    setSearch,
    setRarityFilter,
    setCardTypeFilter,
    setColorsFilter,
    setBloomLevelFilter,
    setSetsFilter,
    setTagsFilter,
    setIsLimitedFilter,
    setIsBuzzFilter,
    setMinHp,
    setMaxHp,
    setSortField,
    setSortOrder,
    // result
    filteredCards,
    hasActiveFilters,
    clearFilters,
  };
}
