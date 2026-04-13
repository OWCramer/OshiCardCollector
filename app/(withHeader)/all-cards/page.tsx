"use client";

import { useState, useMemo, useCallback, forwardRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { SlidersHorizontalIcon } from "lucide-react";
import { useGetAllCardsQuery, useGetRaritiesQuery, useGetSetsQuery } from "@/generated/graphql";
import type { GetAllCardsQuery } from "@/generated/graphql";
import type { Virtualizer } from "@tanstack/react-virtual";
import { ItemCard, CARD_SIZES } from "@/components/Card";
import { Input } from "@/components/Input";
import { Dropdown } from "@/components/Dropdown";
import type { DropdownItem } from "@/components/Dropdown";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useSearch } from "@/hooks/useSearch";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { useScrollLinkedSearch } from "@/hooks/useScrollLinkedSearch";
import { useGridColumns } from "@/hooks/useGridColumns";

const { width: CARD_WIDTH, height: CARD_HEIGHT } = CARD_SIZES["lg"];
const GAP = 20;

type CardNode = GetAllCardsQuery["cards"]["nodes"][number];

/* ------------------------------------------------------------------ */
/*  Sort options (static — these are a UI concern, not from the API)  */
/* ------------------------------------------------------------------ */

const SORT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "id-asc", label: "ID Asc" },
  { value: "id-desc", label: "ID Desc" },
];

/* ------------------------------------------------------------------ */
/*  FilterControls                                                    */
/* ------------------------------------------------------------------ */

interface FilterControlsProps {
  rarityOptions: DropdownItem[];
  selectedRarities: string[];
  onRaritiesChange: (v: string[]) => void;
  setOptions: DropdownItem[];
  selectedSets: string[];
  onSetsChange: (v: string[]) => void;
  sort: string;
  onSortChange: (v: string) => void;
}

function FilterControls({
  rarityOptions,
  selectedRarities,
  onRaritiesChange,
  setOptions,
  selectedSets,
  onSetsChange,
  sort,
  onSortChange,
}: FilterControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        Rarity
      </label>
      <Dropdown
        multi
        value={selectedRarities}
        items={rarityOptions}
        onValueChange={onRaritiesChange}
        className="w-full"
      />

      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-2">
        Set
      </label>
      <Dropdown
        multi
        value={selectedSets}
        items={setOptions}
        onValueChange={onSetsChange}
        className="w-full"
      />

      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-2">
        Sort
      </label>
      <Dropdown value={sort} items={SORT_OPTIONS} onValueChange={onSortChange} className="w-full" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SearchBar                                                         */
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, loading } = useGetAllCardsQuery({ variables: { pageSize: 0 } });
  const { data: raritiesData } = useGetRaritiesQuery();
  const { data: setsData } = useGetSetsQuery();

  // Read initial state from URL params
  const selectedRarities = useMemo(() => searchParams.getAll("rarity"), [searchParams]);
  const selectedSets = useMemo(() => searchParams.getAll("set"), [searchParams]);
  const sort = searchParams.get("sort") ?? "none";
  const initialQuery = searchParams.get("q") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === null) continue;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else if (value) {
          params.set(key, value);
        }
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const handleRaritiesChange = (v: string[]) => {
    updateParams({ rarity: v.length ? v : null });
    scrollToTop();
  };
  const handleSetsChange = (v: string[]) => {
    updateParams({ set: v.length ? v : null });
    scrollToTop();
  };
  const handleSortChange = (v: string) => {
    updateParams({ sort: v === "none" ? null : v });
    scrollToTop();
  };
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isLg = useBreakpoint("lg");

  // Build dropdown options from API data
  const rarityOptions = useMemo<DropdownItem[]>(
    () => (raritiesData?.rarities ?? []).map((r) => ({ value: r, label: r })),
    [raritiesData]
  );
  const setOptions = useMemo<DropdownItem[]>(
    () => (setsData?.sets ?? []).map((s) => ({ value: s, label: s })),
    [setsData]
  );

  // Filter + sort pipeline
  const allCards = useMemo(() => data?.cards.nodes ?? [], [data]);

  const filteredCards = useMemo(() => {
    let result = allCards;
    if (selectedRarities.length > 0) {
      result = result.filter((c) => selectedRarities.includes(c.rarity));
    }
    if (selectedSets.length > 0) {
      result = result.filter((c) => c.setNames.some((s) => selectedSets.includes(s)));
    }
    return result;
  }, [allCards, selectedRarities, selectedSets]);

  const sortedCards = useMemo(() => {
    if (sort === "none") return filteredCards;
    const sorted = [...filteredCards];
    switch (sort) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "id-asc":
        sorted.sort((a, b) => a.id - b.id);
        break;
      case "id-desc":
        sorted.sort((a, b) => b.id - a.id);
        break;
    }
    return sorted;
  }, [filteredCards, sort]);

  // Search (runs on the already-filtered & sorted list)
  const searchOptions = useMemo(() => SEARCH_OPTIONS, []);
  const { query, setQuery, results } = useSearch(sortedCards, searchOptions, initialQuery);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      updateParams({ q: q || null });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setQuery, updateParams]
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

  // Shared filter props for both desktop sidebar and mobile modal
  const filterProps: FilterControlsProps = {
    rarityOptions,
    selectedRarities,
    onRaritiesChange: handleRaritiesChange,
    setOptions,
    selectedSets,
    onSetsChange: handleSetsChange,
    sort,
    onSortChange: handleSortChange,
  };

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
            <aside className="sticky top-20.25 self-start w-56 shrink-0 z-10">
              <div ref={sidebarSlotRef} style={{ height: 0, overflow: "hidden" }}>
                <div style={{ height: 36 }} />
              </div>
              <FilterControls {...filterProps} />
            </aside>

            <div className="flex-1 min-w-0">
              {!loading && results.length === 0 ? (
                <EmptyState ref={gridRef} />
              ) : (
                <VirtualGrid
                  ref={gridRef}
                  virtualizer={rowVirtualizer}
                  results={results}
                  columns={columns}
                />
              )}
              {loading && <Spinner />}
            </div>
          </div>
        ) : (
          <>
            {!loading && results.length === 0 ? (
              <EmptyState ref={gridRef} />
            ) : (
              <VirtualGrid
                ref={gridRef}
                virtualizer={rowVirtualizer}
                results={results}
                columns={columns}
              />
            )}
            {loading && <Spinner />}
          </>
        )}
      </main>

      {/* Mobile filter modal */}
      <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <FilterControls {...filterProps} />
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Virtualized card grid                                             */
/* ------------------------------------------------------------------ */

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
/*  Empty state                                                       */
/* ------------------------------------------------------------------ */

const EmptyState = forwardRef<HTMLDivElement>(function EmptyState(_, ref) {
  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-lg font-medium text-zinc-400 dark:text-zinc-500">No cards found</p>
      <p className="mt-1 text-sm text-zinc-400/70 dark:text-zinc-500/70">
        Try adjusting your filters or search query
      </p>
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
