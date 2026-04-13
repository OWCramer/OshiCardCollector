"use client";

import { useState, useMemo, useCallback } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { SlidersHorizontalIcon } from "lucide-react";
import { useGetAllCardsQuery } from "@/generated/graphql";
import { ItemCard, CARD_SIZES } from "@/components/Card";
import { Input } from "@/components/Input";
import { Dropdown } from "@/components/Dropdown";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useSearch } from "@/hooks/useSearch";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { useScrollLinkedSearch } from "@/hooks/useScrollLinkedSearch";
import { useGridColumns } from "@/hooks/useGridColumns";

const { width: CARD_WIDTH, height: CARD_HEIGHT } = CARD_SIZES["lg"];
const GAP = 20;

/* ------------------------------------------------------------------ */
/*  Filter options (static)                                           */
/* ------------------------------------------------------------------ */

const RARITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
];

const SET_OPTIONS = [
  { value: "all", label: "All" },
  { value: "set1", label: "Set 1" },
  { value: "set2", label: "Set 2" },
  { value: "set3", label: "Set 3" },
];

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "id-asc", label: "ID Asc" },
  { value: "id-desc", label: "ID Desc" },
];

function FilterControls() {
  const [rarity, setRarity] = useState("all");
  const [set, setSet] = useState("all");
  const [sort, setSort] = useState("name-asc");

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        Rarity
      </label>
      <Dropdown value={rarity} items={RARITY_OPTIONS} onValueChange={setRarity} className="w-full" />

      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-2">
        Set
      </label>
      <Dropdown value={set} items={SET_OPTIONS} onValueChange={setSet} className="w-full" />

      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-2">
        Sort
      </label>
      <Dropdown value={sort} items={SORT_OPTIONS} onValueChange={setSort} className="w-full" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Search bar (renders once, used in both mobile & desktop slots)    */
/* ------------------------------------------------------------------ */

function SearchBar({
  query,
  setQuery,
  ref,
}: {
  query: string;
  setQuery: (q: string) => void;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref}>
      <Input
        placeholder="Search cards..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

const SEARCH_OPTIONS = { keys: ["name", "id"], threshold: 0.3 };

export default function AllCardsPage() {
  const { data, loading } = useGetAllCardsQuery({ variables: { pageSize: 0 } });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isLg = useBreakpoint("lg");

  // Search
  const cards = data?.cards.nodes ?? [];
  const searchOptions = useMemo(() => SEARCH_OPTIONS, []);
  const { query, setQuery, results } = useSearch(cards, searchOptions);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setQuery],
  );

  // Grid measurement
  const { ref: gridRef, columns, scrollMargin } = useGridColumns(CARD_WIDTH, GAP);

  // Scroll-linked search bar animation (desktop only)
  const { searchRef, topSlotRef, sidebarSlotRef } = useScrollLinkedSearch(isLg);

  // Virtualizer
  const rowCount = Math.ceil(results.length / columns);
  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 5,
    scrollMargin,
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-6">
        {/* ---- Desktop: search bar in top slot ---- */}
        {isLg && (
          <div className="mb-4" ref={topSlotRef} style={{ minHeight: 36 }}>
            <SearchBar ref={searchRef} query={query} setQuery={handleSearch} />
          </div>
        )}

        {/* ---- Mobile: sticky search bar + filter toggle ---- */}
        {!isLg && (
          <div className="sticky top-15.25 z-30 -mx-6 -mt-6 mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md px-6 py-3">
            <Input
              placeholder="Search cards..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Button
              icon={SlidersHorizontalIcon}
              variant="transparent"
              highContrast
              onClick={() => setFiltersOpen(true)}
            />
          </div>
        )}

        {/* ---- Main content area ---- */}
        {isLg ? (
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="sticky top-20.25 self-start w-56 shrink-0">
              <div ref={sidebarSlotRef} style={{ height: 0, overflow: "hidden" }}>
                <div style={{ height: 36 }} />
              </div>
              <FilterControls />
            </aside>

            {/* Card grid */}
            <div className="flex-1 min-w-0">
              <VirtualGrid
                ref={gridRef}
                virtualizer={rowVirtualizer}
                results={results}
                columns={columns}
              />
              {loading && <Spinner />}
            </div>
          </div>
        ) : (
          <>
            <VirtualGrid
              ref={gridRef}
              virtualizer={rowVirtualizer}
              results={results}
              columns={columns}
            />
            {loading && <Spinner />}
          </>
        )}
      </main>

      {/* Mobile filter modal */}
      <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <FilterControls />
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Virtualized card grid                                             */
/* ------------------------------------------------------------------ */

import { forwardRef } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import type { GetAllCardsQuery } from "@/generated/graphql";

type CardNode = GetAllCardsQuery["cards"]["nodes"][number];

const VirtualGrid = forwardRef<
  HTMLDivElement,
  {
    virtualizer: Virtualizer<Window, Element>;
    results: CardNode[];
    columns: number;
  }
>(function VirtualGrid({ virtualizer, results, columns }, ref) {
  return (
    <div ref={ref} style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const start = virtualRow.index * columns;
        const rowCards = results.slice(start, start + columns);
        return (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            <div className="flex gap-5 justify-center">
              {rowCards.map((card) => (
                <ItemCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Loading spinner                                                   */
/* ------------------------------------------------------------------ */

function Spinner() {
  return (
    <div className="flex justify-center py-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
    </div>
  );
}
