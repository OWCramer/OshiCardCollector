"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { type GetAllCardsQuery } from "@/generated/graphql";

export type CardNode = GetAllCardsQuery["cards"]["nodes"][number];

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
  "Spot": 0,
  "Debut": 1,
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
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
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
      result = ra === rb ? a.rarity.localeCompare(b.rarity) : ra - rb;
      break;
    }
    case "hp": {
      const ha = a.hp ?? -1;
      const hb = b.hp ?? -1;
      result = ha - hb;
      break;
    }
    case "bloomLevel": {
      const ba = a.bloomLevel == null ? 99 : (BLOOM_ORDER[a.bloomLevel] ?? 99);
      const bb = b.bloomLevel == null ? 99 : (BLOOM_ORDER[b.bloomLevel] ?? 99);
      result = ba - bb;
      break;
    }
    case "releaseDate": {
      const da = a.releaseDate;
      const db = b.releaseDate;
      if (!da && !db) result = 0;
      else if (!da) result = 1;
      else if (db) {
        result = da.localeCompare(db);
      } else {
        result = -1;
      }
      break;
    }
  }

  return order === "asc" ? result : -result;
}

// ─── hook ────────────────────────────────────────────────────────────────────

export function useCardFilters(allCards: CardNode[]) {
  const pathname = usePathname();

  // Snapshot searchParams for this render — only the lazy initializers below
  // actually use it, and those run once on mount.
  const initial = useSearchParams();

  // ── state — initialized once from the URL on mount ──────────────────────
  const [search, setSearch] = useState(() => initial.get("search") ?? "");
  const [rarityFilter, setRarityFilter] = useState(() => parseList(initial.get("rarity")));
  const [cardTypeFilter, setCardTypeFilter] = useState(() => parseList(initial.get("cardType")));
  const [colorsFilter, setColorsFilter] = useState(() => parseList(initial.get("colors")));
  const [bloomLevelFilter, setBloomLevelFilter] = useState(() =>
    parseList(initial.get("bloomLevel"))
  );
  const [setsFilter, setSetsFilter] = useState(() => parseList(initial.get("sets")));
  const [tagsFilter, setTagsFilter] = useState(() => parseList(initial.get("tags")));
  const [isLimitedFilter, setIsLimitedFilter] = useState<true | null>(() =>
    initial.get("isLimited") === "true" ? true : null
  );
  const [isBuzzFilter, setIsBuzzFilter] = useState<true | null>(() =>
    initial.get("isBuzz") === "true" ? true : null
  );
  const [minHp, setMinHp] = useState<number | undefined>(() => parseNumber(initial.get("minHp")));
  const [maxHp, setMaxHp] = useState<number | undefined>(() => parseNumber(initial.get("maxHp")));
  const [sortField, setSortField] = useState<SortField>(
    () => (initial.get("sortField") as SortField) ?? "releaseDate"
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    () => (initial.get("sortOrder") as SortOrder) ?? "asc"
  );

  // Sync state from URL on browser back/forward (popstate fires only on history nav, not router.replace)
  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(globalThis.location.search);
      setSearch(params.get("search") ?? "");
      setRarityFilter(parseList(params.get("rarity")));
      setCardTypeFilter(parseList(params.get("cardType")));
      setColorsFilter(parseList(params.get("colors")));
      setBloomLevelFilter(parseList(params.get("bloomLevel")));
      setSetsFilter(parseList(params.get("sets")));
      setTagsFilter(parseList(params.get("tags")));
      setIsLimitedFilter(params.get("isLimited") === "true" ? true : null);
      setIsBuzzFilter(params.get("isBuzz") === "true" ? true : null);
      setMinHp(parseNumber(params.get("minHp")));
      setMaxHp(parseNumber(params.get("maxHp")));
      setSortField((params.get("sortField") as SortField) ?? "releaseDate");
      setSortOrder((params.get("sortOrder") as SortOrder) ?? "asc");
    }
    globalThis.addEventListener("popstate", syncFromUrl);
    return () => globalThis.removeEventListener("popstate", syncFromUrl);
  }, []);

  // ── URL writer — updates the address bar only, without triggering a Next navigation ────────
  const updateUrl = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(globalThis.location.search);

      if (value == null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const qs = params.toString();
      const nextUrl = `${pathname}${qs ? `?${qs}` : ""}`;

      if (nextUrl === `${globalThis.location.pathname}${globalThis.location.search}`) return;

      globalThis.history.replaceState(null, "", nextUrl);
    },
    [pathname]
  );

  // ── update* — set state + sync URL ──────────────────────────────────────
  const updateSearch = useCallback(
    (v: string) => {
      setSearch(v);
      updateUrl("search", v || null);
    },
    [updateUrl]
  );
  const updateRarityFilter = useCallback(
    (v: string[]) => {
      setRarityFilter(v);
      updateUrl("rarity", v.join(",") || null);
    },
    [updateUrl]
  );
  const updateCardTypeFilter = useCallback(
    (v: string[]) => {
      setCardTypeFilter(v);
      updateUrl("cardType", v.join(",") || null);
    },
    [updateUrl]
  );
  const updateColorsFilter = useCallback(
    (v: string[]) => {
      setColorsFilter(v);
      updateUrl("colors", v.join(",") || null);
    },
    [updateUrl]
  );
  const updateBloomLevelFilter = useCallback(
    (v: string[]) => {
      setBloomLevelFilter(v);
      updateUrl("bloomLevel", v.join(",") || null);
    },
    [updateUrl]
  );
  const updateSetsFilter = useCallback(
    (v: string[]) => {
      setSetsFilter(v);
      updateUrl("sets", v.join(",") || null);
    },
    [updateUrl]
  );
  const updateTagsFilter = useCallback(
    (v: string[]) => {
      setTagsFilter(v);
      updateUrl("tags", v.join(",") || null);
    },
    [updateUrl]
  );
  const updateIsLimitedFilter = useCallback(
    (v: true | null) => {
      setIsLimitedFilter(v);
      updateUrl("isLimited", v ? "true" : null);
    },
    [updateUrl]
  );
  const updateIsBuzzFilter = useCallback(
    (v: true | null) => {
      setIsBuzzFilter(v);
      updateUrl("isBuzz", v ? "true" : null);
    },
    [updateUrl]
  );
  const updateMinHp = useCallback(
    (v: number | undefined) => {
      setMinHp(v);
      updateUrl("minHp", v == null ? null : String(v));
    },
    [updateUrl]
  );
  const updateMaxHp = useCallback(
    (v: number | undefined) => {
      setMaxHp(v);
      updateUrl("maxHp", v == null ? null : String(v));
    },
    [updateUrl]
  );
  const updateSortField = useCallback(
    (v: SortField) => {
      setSortField(v);
      updateUrl("sortField", v);
    },
    [updateUrl]
  );
  const updateSortOrder = useCallback(
    (v: SortOrder) => {
      setSortOrder(v);
      updateUrl("sortOrder", v);
    },
    [updateUrl]
  );

  // ── derived ──────────────────────────────────────────────────────────────
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

  const clearFilters = useCallback(() => {
    setSearch("");
    setRarityFilter([]);
    setCardTypeFilter([]);
    setColorsFilter([]);
    setBloomLevelFilter([]);
    setSetsFilter([]);
    setTagsFilter([]);
    setIsLimitedFilter(null);
    setIsBuzzFilter(null);
    setMinHp(undefined);
    setMaxHp(undefined);
  }, []);

  // URL preserving only sorting params — used by the Clear filters Link
  const clearFiltersHref = useMemo(() => {
    const params = new URLSearchParams();
    if (sortField !== "releaseDate") params.set("sortField", sortField);
    if (sortOrder !== "asc") params.set("sortOrder", sortOrder);
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, sortField, sortOrder]);

  // ── fuzzy search ─────────────────────────────────────────────────────────
  const fuse = useMemo(
    () =>
      new Fuse(allCards, {
        keys: ["name", "cardNumber", "tags", "specialText", "extraText"],
        threshold: 0.35,
        ignoreLocation: true,
        ignoreDiacritics: true,
        shouldSort: false,
        useExtendedSearch: true,
      }),
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
      if (colorsFilter.length > 0 && !card.colors.some((c) => colorsFilter.includes(c)))
        return false;
      if (bloomLevelFilter.length > 0) {
        if (!card.bloomLevel || !bloomLevelFilter.includes(card.bloomLevel)) return false;
      }
      if (setsFilter.length > 0 && !setsFilter.some((s) => card.setNames.includes(s))) return false;
      if (tagsFilter.length > 0 && !tagsFilter.some((t) => card.tags.includes(t))) return false;
      if (isLimitedFilter === true && !card.isLimited) return false;
      if (isBuzzFilter === true && !card.isBuzz) return false;
      if (minHp !== undefined && (card.hp == null || card.hp < minHp)) return false;
      return !(maxHp !== undefined && (card.hp == null || card.hp > maxHp));
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
    // updaters (set state + URL)
    setSearch: updateSearch,
    setRarityFilter: updateRarityFilter,
    setCardTypeFilter: updateCardTypeFilter,
    setColorsFilter: updateColorsFilter,
    setBloomLevelFilter: updateBloomLevelFilter,
    setSetsFilter: updateSetsFilter,
    setTagsFilter: updateTagsFilter,
    setIsLimitedFilter: updateIsLimitedFilter,
    setIsBuzzFilter: updateIsBuzzFilter,
    setMinHp: updateMinHp,
    setMaxHp: updateMaxHp,
    setSortField: updateSortField,
    setSortOrder: updateSortOrder,
    // result
    filteredCards,
    hasActiveFilters,
    clearFilters,
    clearFiltersHref,
  };
}
