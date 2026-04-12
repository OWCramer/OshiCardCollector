"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { SlidersHorizontalIcon } from "lucide-react";
import { useGetAllCardsQuery } from "@/generated/graphql";
import { ItemCard, CARD_SIZES, type CardSize } from "@/components/Card";
import { Input } from "@/components/Input";
import { Dropdown } from "@/components/Dropdown";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useSearch } from "@/hooks/useSearch";
import { useBreakpoint } from "@/lib/useBreakpoint";

const GAP = 20;
const SCROLL_RANGE = 80; // px of scroll over which the animation happens

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
      <Dropdown
        value={rarity}
        items={RARITY_OPTIONS}
        onValueChange={setRarity}
        className="w-full"
      />
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function AllCardsPage() {
  const { data, loading } = useGetAllCardsQuery({ variables: { pageSize: 0 } });
  const gridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMd = useBreakpoint("md");
  const isLg = useBreakpoint("lg");

  // Calculate columns using sm size to determine if we can fit 2+
  const smCols = Math.max(1, Math.floor((containerWidth + GAP) / (CARD_SIZES["sm"].width + GAP)));
  // Use lg cards on md+ screens, or when only 1 column fits (so single cards are big)
  const cardSize: CardSize = isMd || smCols <= 1 ? "lg" : "sm";
  const { width: cardWidth, height: cardHeight } = CARD_SIZES[cardSize];
  const columns = Math.max(1, Math.floor((containerWidth + GAP) / (cardWidth + GAP)));

  // Refs for scroll-linked search bar animation
  const searchRef = useRef<HTMLDivElement>(null);
  const topSlotRef = useRef<HTMLDivElement>(null);
  const sidebarSlotRef = useRef<HTMLDivElement>(null);
  const cards = data?.cards.nodes ?? [];
  const searchOptions = useMemo(() => ({ keys: ["name", "id"], threshold: 0.3 }), []);
  const { query, setQuery, results } = useSearch(cards, searchOptions);

  // Scroll-linked animation for desktop search bar
  const updateSearchPosition = useCallback(() => {
    const searchEl = searchRef.current;
    const topSlot = topSlotRef.current;
    const sidebarSlot = sidebarSlotRef.current;
    if (!searchEl || !topSlot || !sidebarSlot || !isLg) return;

    // t goes 0→1 over SCROLL_RANGE starting from scroll 0
    const t = Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE));

    // Get positions of both slots
    const topRect = topSlot.getBoundingClientRect();
    const sidebarRect = sidebarSlot.getBoundingClientRect();

    // At scroll top, use normal flow so it rubber-bands with the page
    if (t === 0) {
      searchEl.style.position = "";
      searchEl.style.left = "";
      searchEl.style.top = "";
      searchEl.style.width = "";
      searchEl.style.zIndex = "";
      sidebarSlot.style.height = "0";
      sidebarSlot.style.marginBottom = "0";
      return;
    }

    // Interpolate position and width
    const x = lerp(topRect.left, sidebarRect.left, t);
    const y = lerp(topRect.top, sidebarRect.top, t);
    const w = lerp(topRect.width, sidebarRect.width, t);

    searchEl.style.position = "fixed";
    searchEl.style.left = `${x}px`;
    searchEl.style.top = `${y}px`;
    searchEl.style.width = `${w}px`;
    searchEl.style.zIndex = "35";

    // Animate sidebar slot height to push filters down smoothly
    sidebarSlot.style.height = `${lerp(0, 36, t)}px`;
    sidebarSlot.style.marginBottom = `${lerp(0, 16, t)}px`;
  }, [isLg]);

  useEffect(() => {
    if (!isLg) {
      // Reset search bar styles when not on desktop
      const searchEl = searchRef.current;
      if (searchEl) {
        searchEl.style.position = "";
        searchEl.style.left = "";
        searchEl.style.top = "";
        searchEl.style.width = "";
        searchEl.style.zIndex = "";
      }
      return;
    }

    function onScroll() {
      requestAnimationFrame(updateSearchPosition);
    }

    // Initial position
    requestAnimationFrame(updateSearchPosition);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isLg, updateSearchPosition]);

  // Track grid container width
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
      setScrollMargin(el.offsetTop);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rowCount = Math.ceil(results.length / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => cardHeight + GAP,
    overscan: 5,
    scrollMargin,
  });

  const cardGrid = (
    <div ref={gridRef} style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const startIndex = virtualRow.index * columns;
        const rowCards = results.slice(startIndex, startIndex + columns);
        return (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
            }}
          >
            <div className="flex gap-5 justify-center">
              {rowCards.map((card) => (
                <ItemCard key={card.id} card={card} size={cardSize} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-6">
        {/* Desktop: top slot contains the search bar */}
        {isLg && (
          <div className="mb-4" ref={topSlotRef} style={{ minHeight: 36 }}>
            <div ref={searchRef}>
              <Input
                placeholder="Search cards..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Mobile: sticky search bar + filter button */}
        {!isLg && (
          <div className="sticky top-15.25 z-30 -mx-6 -mt-6 mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md px-6 py-3">
            <Input
              placeholder="Search cards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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

        {/* Desktop: sidebar + grid layout */}
        {isLg ? (
          <div className="flex gap-6">
            <aside className="sticky top-20.25 self-start w-56 shrink-0">
              {/* Sidebar slot (measurement target for search bar destination) */}
              <div ref={sidebarSlotRef} style={{ height: 0, overflow: "hidden" }}>
                <div style={{ height: 36 }} />
              </div>
              <FilterControls />
            </aside>
            <div className="flex-1 min-w-0">{cardGrid}</div>
          </div>
        ) : (
          cardGrid
        )}

        {loading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        )}
      </main>

      {/* Mobile filter modal */}
      <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <FilterControls />
      </Modal>
    </div>
  );
}
