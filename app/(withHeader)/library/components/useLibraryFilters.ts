"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Breakdown,
  LibraryDefaults,
  LibraryState,
  SortField,
  SortOrder,
  SpecialFilter,
} from "./types";
import { FACTORY_DEFAULTS } from "./types";

const LS_KEY = "library_filters_v1";

function loadFromStorage(): Partial<LibraryState> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Partial<LibraryState>) : null;
  } catch {
    return null;
  }
}

function saveToStorage(state: LibraryState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

export function useLibraryFilters(defaults: LibraryDefaults | null) {
  const [state, setState] = useState<LibraryState>(() => {
    const base: LibraryState = { ...(defaults ?? FACTORY_DEFAULTS), search: "" };
    const saved = loadFromStorage();
    return saved ? { ...base, ...saved } : base;
  });

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const set = useCallback(<K extends keyof LibraryState>(key: K, value: LibraryState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const resetPage = useCallback(() => {
    const base: LibraryState = { ...(defaults ?? FACTORY_DEFAULTS), search: "" };
    setState(base);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  }, [defaults]);

  return {
    ...state,
    setSortField: (v: SortField) => set("sortField", v),
    setSortOrder: (v: SortOrder) => set("sortOrder", v),
    setBreakdowns: (v: Breakdown[]) => set("breakdowns", v),
    setSearch: (v: string) => set("search", v),
    setColorFilter: (v: string[]) => set("colorFilter", v),
    setTypeFilter: (v: string[]) => set("typeFilter", v),
    setBloomFilter: (v: string[]) => set("bloomFilter", v),
    setRarityFilter: (v: string[]) => set("rarityFilter", v),
    setTagsFilter: (v: string[]) => set("tagsFilter", v),
    setSpecialFilter: (v: SpecialFilter) => set("specialFilter", v),
    resetPage,
  };
}
