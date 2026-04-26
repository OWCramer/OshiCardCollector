"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Breakdown, SortField, SortOrder, SpecialFilter } from "./types";

function parseList(v: string | null): string[] {
  return v ? v.split(",").filter(Boolean) : [];
}

export function useLibraryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lazy-initialize from URL once on mount.
  const [sortField, setSortFieldState]       = useState<SortField>(() => (searchParams.get("sortField") as SortField) ?? "name");
  const [sortOrder, setSortOrderState]       = useState<SortOrder>(() => (searchParams.get("sortOrder") as SortOrder) ?? "asc");
  const [breakdown, setBreakdownState]       = useState<Breakdown>(() => (searchParams.get("breakdown") as Breakdown) ?? "none");
  const [search, setSearchState]             = useState(() => searchParams.get("search") ?? "");
  const [colorFilter, setColorFilterState]   = useState(() => parseList(searchParams.get("color")));
  const [typeFilter, setTypeFilterState]     = useState(() => parseList(searchParams.get("type")));
  const [bloomFilter, setBloomFilterState]   = useState(() => parseList(searchParams.get("bloom")));
  const [rarityFilter, setRarityFilterState] = useState(() => parseList(searchParams.get("rarity")));
  const [tagsFilter, setTagsFilterState]     = useState(() => parseList(searchParams.get("tags")));
  const [specialFilter, setSpecialFilterState] = useState<SpecialFilter>(() => (searchParams.get("special") as SpecialFilter) ?? "all");

  // Sync state on browser back/forward.
  useEffect(() => {
    function syncFromUrl() {
      const p = new URLSearchParams(window.location.search);
      setSortFieldState((p.get("sortField") as SortField) ?? "name");
      setSortOrderState((p.get("sortOrder") as SortOrder) ?? "asc");
      setBreakdownState((p.get("breakdown") as Breakdown) ?? "none");
      setSearchState(p.get("search") ?? "");
      setColorFilterState(parseList(p.get("color")));
      setTypeFilterState(parseList(p.get("type")));
      setBloomFilterState(parseList(p.get("bloom")));
      setRarityFilterState(parseList(p.get("rarity")));
      setTagsFilterState(parseList(p.get("tags")));
      setSpecialFilterState((p.get("special") as SpecialFilter) ?? "all");
    }
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const updateUrl = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) { params.set(key, value); } else { params.delete(key); }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Each setter updates state and writes to URL. Omit default values to keep URLs clean.
  const setSortField     = useCallback((v: SortField)      => { setSortFieldState(v);       updateUrl("sortField",  v !== "name"  ? v : null); }, [updateUrl]);
  const setSortOrder     = useCallback((v: SortOrder)      => { setSortOrderState(v);       updateUrl("sortOrder",  v !== "asc"   ? v : null); }, [updateUrl]);
  const setBreakdown     = useCallback((v: Breakdown)      => { setBreakdownState(v);       updateUrl("breakdown",  v !== "none"  ? v : null); }, [updateUrl]);
  const setSearch        = useCallback((v: string)         => { setSearchState(v);          updateUrl("search",     v || null); }, [updateUrl]);
  const setColorFilter   = useCallback((v: string[])       => { setColorFilterState(v);     updateUrl("color",      v.join(",") || null); }, [updateUrl]);
  const setTypeFilter    = useCallback((v: string[])       => { setTypeFilterState(v);      updateUrl("type",       v.join(",") || null); }, [updateUrl]);
  const setBloomFilter   = useCallback((v: string[])       => { setBloomFilterState(v);     updateUrl("bloom",      v.join(",") || null); }, [updateUrl]);
  const setRarityFilter  = useCallback((v: string[])       => { setRarityFilterState(v);    updateUrl("rarity",     v.join(",") || null); }, [updateUrl]);
  const setTagsFilter    = useCallback((v: string[])       => { setTagsFilterState(v);      updateUrl("tags",       v.join(",") || null); }, [updateUrl]);
  const setSpecialFilter = useCallback((v: SpecialFilter)  => { setSpecialFilterState(v);   updateUrl("special",    v !== "all"   ? v : null); }, [updateUrl]);

  return {
    sortField, setSortField,
    sortOrder, setSortOrder,
    breakdown, setBreakdown,
    search, setSearch,
    colorFilter, setColorFilter,
    typeFilter, setTypeFilter,
    bloomFilter, setBloomFilter,
    rarityFilter, setRarityFilter,
    tagsFilter, setTagsFilter,
    specialFilter, setSpecialFilter,
  };
}
