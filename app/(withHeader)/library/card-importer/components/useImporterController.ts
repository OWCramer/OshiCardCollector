"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { useImporterStore } from "../importerStore";
import { searchGroups } from "./searchCards";
import { sortRows } from "./sortRows";
import type { CardGroup, LedgerRow, SearchHit, SortMode } from "./types";
import type { CardGroupIndex } from "./cardGroups";

export interface ImporterController {
  query: string;
  setQuery: (query: string) => void;
  results: SearchHit[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  rows: LedgerRow[];
  totalCards: number;
  /** Rows still waiting on a rarity. Save is blocked while this is non-empty. */
  unansweredCount: number;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  index: CardGroupIndex;

  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  commitSelected: () => void;
  pickGroup: (group: CardGroup) => void;
}

/**
 * The importer's whole interaction model, with no markup attached — so the
 * desktop and mobile layouts render the same state and swapping between them
 * costs nothing but DOM focus.
 *
 * Lives in React state rather than the zustand store: query and selection churn
 * on every keystroke, and there's no reason to push that through the store's
 * subscriber notifications.
 */
export function useImporterController(index: CardGroupIndex): ImporterController {
  const [query, setQueryState] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const storeEntries = useImporterStore((s) => s.entries);
  const sortMode = useImporterStore((s) => s.sortMode);
  const setSortMode = useImporterStore((s) => s.setSortMode);
  const addPrinting = useImporterStore((s) => s.addPrinting);
  const queueCard = useImporterStore((s) => s.queueCard);
  const assignPrinting = useImporterStore((s) => s.assignPrinting);

  const results = useMemo(() => searchGroups(index.groups, query), [index.groups, query]);

  const rows = useMemo<LedgerRow[]>(() => {
    const joined = Object.values(storeEntries).map((entry) => ({
      entry,
      card:
        entry.cardId === null
          ? undefined
          : index.byCardId.get(entry.cardId)?.printings.find((p) => p.id === entry.cardId),
      group: index.byKey.get(entry.groupKey),
      isActiveQuestion: false,
    }));
    const sorted = sortRows(joined, sortMode);
    // Number keys always answer the topmost row that's still waiting — and
    // sortRows pins those to the top under every sort, so this stays reachable.
    const active = sorted.find((r) => r.entry.cardId === null);
    return active
      ? sorted.map((r) => (r === active ? { ...r, isActiveQuestion: true } : r))
      : sorted;
  }, [storeEntries, index, sortMode]);

  const totalCards = useMemo(() => rows.reduce((sum, r) => sum + r.entry.quantity, 0), [rows]);
  const unansweredCount = useMemo(() => rows.filter((r) => r.entry.cardId === null).length, [rows]);

  const setQuery = useCallback((next: string) => {
    setQueryState(next);
    setSelectedIndex(0);
  }, []);

  /**
   * One printing commits straight away. Several go into the queue unanswered so
   * you can keep typing — the rarity question waits in the ledger.
   */
  const pickGroup = useCallback(
    (group: CardGroup) => {
      if (group.printings.length === 1) addPrinting(group.printings[0].id, group.key);
      else queueCard(group.key);
      setQueryState("");
      setSelectedIndex(0);
    },
    [addPrinting, queueCard]
  );

  const commitSelected = useCallback(() => {
    const hit = results[selectedIndex];
    if (hit) pickGroup(hit.group);
  }, [results, selectedIndex, pickGroup]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Digits answer the queue only while the query is empty — card numbers
      // are full of digits, so this must never swallow typing.
      if (!query && /^[1-9]$/.test(e.key)) {
        const active = rows.find((r) => r.isActiveQuestion);
        const printings = active?.group?.printings;
        if (active && printings) {
          const n = Number(e.key);
          if (n <= printings.length) {
            e.preventDefault();
            assignPrinting(active.entry.key, printings[n - 1].id);
            return;
          }
        }
        // No queue, or out of range: fall through and type the digit.
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (results.length) setSelectedIndex((i) => (i + 1) % results.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (results.length) setSelectedIndex((i) => (i - 1 + results.length) % results.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        commitSelected();
        return;
      }
      if (e.key === "Escape" && query) {
        e.preventDefault();
        setQuery("");
      }
      // Escape on an empty query deliberately does nothing — never blur.
    },
    [query, rows, results.length, assignPrinting, commitSelected, setQuery]
  );

  return {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    rows,
    totalCards,
    unansweredCount,
    sortMode,
    setSortMode,
    index,
    onKeyDown,
    commitSelected,
    pickGroup,
  };
}
