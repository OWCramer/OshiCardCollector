"use client";

import {
  CardType,
  useGetAllCardsQuery,
  useGetColorsQuery,
  useGetRaritiesQuery,
  useGetSetsQuery,
  useGetTagsQuery,
} from "@/generated/graphql";
import { Dropdown } from "@/components/Dropdown";
import { OCG_CARD_SIZES, OCGCard } from "@/components/OCGCard";
import { Input } from "@/components/Input";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { type SortField, useCardFilters } from "@/hooks/useCardFilters";
import { ArrowDownIcon, ArrowUpIcon, FilterIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { classes } from "@/lib/classes";
import { Modal } from "@/components/Modal";

// Card dimensions (must match rendered size)
const GAP = 16; // gap-4 = 1rem = 16px

const CARD_TYPE_ITEMS = [
  { value: CardType.Holomem, label: "Holomem" },
  { value: CardType.Oshi, label: "Oshi" },
  { value: CardType.Support, label: "Support" },
  { value: CardType.Cheer, label: "Cheer" },
];

const BLOOM_LEVEL_ITEMS = [
  { value: "Spot", label: "Spot" },
  { value: "Debut", label: "Debut" },
  { value: "1st", label: "1st" },
  { value: "2nd", label: "2nd" },
];

const SORT_FIELD_ITEMS: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "cardNumber", label: "Card Number" },
  { value: "colors", label: "Color" },
  { value: "rarity", label: "Rarity" },
  { value: "hp", label: "HP" },
  { value: "bloomLevel", label: "Bloom Level" },
  { value: "releaseDate", label: "Release Date" },
];

// ─── page export (provides Suspense for useSearchParams) ──────────────────────

export default function AllCardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full p-8">
          <Loader2Icon className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AllCardsContent />
    </Suspense>
  );
}

// ─── inner content ────────────────────────────────────────────────────────────

function AllCardsContent() {
  const { data, loading } = useGetAllCardsQuery({ variables: { pageSize: 0 } });
  const isMedium = useBreakpoint("md");
  const isSmall = !useBreakpoint("sm");

  const { width: CARD_WIDTH, height: CARD_HEIGHT } = useMemo(() => {
    if (isSmall) return OCG_CARD_SIZES["sm"];
    return OCG_CARD_SIZES["lg"];
  }, [isSmall]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── filter-option queries ────────────────────────────────────────────────
  const { data: raritiesData } = useGetRaritiesQuery();
  const { data: setsData } = useGetSetsQuery();
  const { data: colorsData } = useGetColorsQuery();
  const { data: tagsData } = useGetTagsQuery();

  const rarityItems = useMemo(
    () => (raritiesData?.rarities ?? []).map((v) => ({ value: v, label: v })),
    [raritiesData]
  );
  const setItems = useMemo(
    () => (setsData?.sets ?? []).map((v) => ({ value: v, label: v })),
    [setsData]
  );
  const colorItems = useMemo(
    () => (colorsData?.colors ?? []).map((v) => ({ value: v, label: v })),
    [colorsData]
  );
  const tagItems = useMemo(
    () => (tagsData?.tags ?? []).map((v) => ({ value: v, label: v })),
    [tagsData]
  );

  // ── filters ──────────────────────────────────────────────────────────────
  const allCards = useMemo(() => data?.cards?.nodes ?? [], [data?.cards?.nodes]);

  const {
    search,
    setSearch,
    rarityFilter,
    setRarityFilter,
    cardTypeFilter,
    setCardTypeFilter,
    colorsFilter,
    setColorsFilter,
    bloomLevelFilter,
    setBloomLevelFilter,
    setsFilter,
    setSetsFilter,
    tagsFilter,
    setTagsFilter,
    isLimitedFilter,
    setIsLimitedFilter,
    isBuzzFilter,
    setIsBuzzFilter,
    minHp,
    setMinHp,
    maxHp,
    setMaxHp,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    filteredCards,
    hasActiveFilters,
    clearFilters,
    clearFiltersHref,
  } = useCardFilters(allCards);

  useEffect(() => {
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  }, [filteredCards]);

  // ── virtualizer setup ────────────────────────────────────────────────────
  const mainRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
      setScrollMargin(el.offsetTop);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columns = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
  }, [CARD_WIDTH, containerWidth]);

  const rows = useMemo(() => {
    const result: (typeof filteredCards)[number][][] = [];
    for (let i = 0; i < filteredCards.length; i += columns) {
      result.push(filteredCards.slice(i, i + columns));
    }
    return result;
  }, [filteredCards, columns]);

  const rowHeight = CARD_HEIGHT + GAP;

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => rowHeight,
    overscan: 3,
    scrollMargin,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  // ── shared filter panel ───────────────────────────────────────────────────
  const filterPanel = (
    <div className="flex flex-col gap-4">
      {/* Sort */}
      <div className="flex flex-col gap-2">
        <span className="text-sm opacity-75">Sort</span>
        <div className="flex gap-2 items-end">
          <Dropdown
            className="flex-1 min-w-0"
            value={sortField}
            onValueChange={(v) => setSortField(v as SortField)}
            items={SORT_FIELD_ITEMS}
          />
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
            className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ring-1 ring-inset ring-black/15 dark:ring-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            {sortOrder === "asc" ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
          </button>
        </div>
      </div>

      {/* Card Type */}
      <Dropdown
        multi
        label="Card Type"
        className="w-full"
        value={cardTypeFilter}
        onValueChange={setCardTypeFilter}
        items={CARD_TYPE_ITEMS}
      />

      {/* Colors */}
      <Dropdown
        multi
        label="Color"
        className="w-full"
        value={colorsFilter}
        onValueChange={setColorsFilter}
        items={colorItems}
      />

      {/* Rarity */}
      <Dropdown
        multi
        label="Rarity"
        className="w-full"
        value={rarityFilter}
        onValueChange={setRarityFilter}
        items={rarityItems}
      />

      {/* Bloom Level */}
      <Dropdown
        multi
        label="Bloom Level"
        className="w-full"
        value={bloomLevelFilter}
        onValueChange={setBloomLevelFilter}
        items={BLOOM_LEVEL_ITEMS}
      />

      {/* HP range */}
      <div className="flex flex-col gap-2">
        <span className="text-sm opacity-75">HP</span>
        <div className="flex gap-2">
          <Input
            className="w-full"
            type="number"
            placeholder="Min"
            value={minHp ?? ""}
            onChange={(e) => setMinHp(e.target.value ? parseInt(e.target.value, 10) : undefined)}
          />
          <Input
            className="w-full"
            type="number"
            placeholder="Max"
            value={maxHp ?? ""}
            onChange={(e) => setMaxHp(e.target.value ? parseInt(e.target.value, 10) : undefined)}
          />
        </div>
      </div>

      {/* Set */}
      <Dropdown
        multi
        label="Set"
        className="w-full"
        value={setsFilter}
        onValueChange={setSetsFilter}
        items={setItems}
      />

      {/* Tags */}
      <Dropdown
        multi
        label="Tags"
        className="w-full"
        value={tagsFilter}
        onValueChange={setTagsFilter}
        items={tagItems}
      />

      {/* Toggles */}
      <div className="flex flex-col gap-3 pt-1">
        <Checkbox
          checked={isLimitedFilter === true}
          onCheckedChange={(v) => setIsLimitedFilter(v ? true : null)}
          label="Limited only"
        />
        <Checkbox
          checked={isBuzzFilter === true}
          onCheckedChange={(v) => setIsBuzzFilter(v ? true : null)}
          label="Buzz only"
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Link href={clearFiltersHref} onClick={clearFilters} className="w-full">
          <Button variant="transparent" highContrast className="w-full">
            Clear filters
          </Button>
        </Link>
      )}
    </div>
  );

  const mainContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center w-full">
          <Loader2Icon className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    if (filteredCards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center opacity-50">
          <span className="text-4xl">
            <SearchIcon />
          </span>
          <p className="text-lg font-medium">No cards found</p>
          {hasActiveFilters && <p className="text-sm">Try adjusting your filters</p>}
        </div>
      );
    }
    return (
      <div style={{ height: totalHeight + (isMedium ? 0 : 96), position: "relative" }}>
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <div
                className={classes(
                  "flex gap-4 items-center pb-4",
                  isMedium ? "justify-start" : "justify-center"
                )}
              >
                {row.map((card) => (
                  <OCGCard key={card.id} card={card} size={isSmall ? "sm" : "lg"} goToCard />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [
    loading,
    filteredCards,
    hasActiveFilters,
    totalHeight,
    virtualRows,
    rows,
    isMedium,
    isSmall,
    virtualizer.measureElement,
    virtualizer.options.scrollMargin,
  ]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full p-8 relative">
      <aside className="flex flex-row md:flex-col gap-4 md:w-full md:max-w-48 xl:max-w-64 fixed bottom-6 left-4 right-4 md:sticky md:top-23.25 md:self-start h-fit md:max-h-[calc(100dvh-6.5rem)] md:overflow-y-auto md:overscroll-contain bg-white/50 dark:bg-black/50 backdrop-blur ring-1 ring-inset ring-black/10 dark:ring-white/15 rounded-lg p-4 z-10">
        <Input
          className="w-full"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isMedium ? (
          filterPanel
        ) : (
          <Button
            variant="transparent"
            highContrast
            icon={FilterIcon}
            onClick={() => setShowMobileFilters(true)}
          />
        )}
      </aside>

      <div ref={mainRef} className="flex-1">
        {mainContent}
      </div>

      <Modal title="Filters" isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)}>
        {filterPanel}
      </Modal>
    </div>
  );
}
