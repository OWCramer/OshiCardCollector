"use client";

import { useMemo, useState } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";

interface UseSearchResult<T> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
}

export function useSearch<T>(items: T[], options: IFuseOptions<T>): UseSearchResult<T> {
  const [query, setQuery] = useState("");

  const fuse = useMemo(() => new Fuse(items, options), [items, options]);

  const results = useMemo(() => {
    if (!query.trim()) return items;
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query, items]);

  return { query, setQuery, results };
}
