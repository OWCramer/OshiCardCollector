"use client";

import { useEffect, useMemo, useState } from "react";
import { type GetAllCardsFullQuery, useGetAllCardsFullLazyQuery } from "@/generated/graphql";
import { useLibrary } from "@/lib/library-context";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/Card";
import { OCG_CARD_SIZES, OCGCard } from "@/components/OCGCard";
import { Checkbox } from "@/components/Checkbox";
import { Tabs, type Tab } from "@/components/Tabs";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Dropdown } from "@/components/Dropdown";
import { SlidersHorizontalIcon } from "lucide-react";
import { classes } from "@/lib/classes";
import { useCardLibraryFilters, SORT_ITEMS, type SortField } from "../useCardLibraryFilters";
import { useVirtualGrid } from "../useVirtualGrid";
import { useDeckRules } from "../useDeckRules";
import { type DeckEntry } from "../DeckPreview/types";
import { useLongPress } from "./useLongPress";

export type FullCardEntry = GetAllCardsFullQuery["cards"]["nodes"][number];

type LibraryTab = "all" | "oshi" | "holomem" | "cheer" | "support";

const LIBRARY_TABS: Tab<LibraryTab>[] = [
  { value: "all", label: "All" },
  { value: "oshi", label: "Oshi" },
  { value: "holomem", label: "Holomem" },
  { value: "cheer", label: "Cheer" },
  { value: "support", label: "Support" },
];

const TAB_CARD_TYPE: Partial<Record<LibraryTab, string>> = {
  oshi: "OSHI", holomem: "HOLOMEM", cheer: "CHEER", support: "SUPPORT",
};

const GAP = 8;
const { width: CARD_WIDTH, height: CARD_HEIGHT } = OCG_CARD_SIZES["xs"];

// r=14 → circumference = 2π×14 ≈ 87.96
const RING_C = 87.96;

interface MobileCardLibraryProps {
  deck: DeckEntry[];
  onCardClick: (card: FullCardEntry) => void;
  onCardPreview: (card: FullCardEntry) => void;
  onCardsLoaded?: (cards: FullCardEntry[]) => void;
}

function LibraryCard({
  card,
  atLimit,
  overlayText,
  onClick,
  onPreview,
}: {
  card: FullCardEntry;
  atLimit: boolean;
  overlayText?: string;
  onClick: () => void;
  onPreview: () => void;
}) {
  const { pressing, ...handlers } = useLongPress({
    onClick: atLimit ? () => {} : onClick,
    onLongPress: onPreview,
  });

  return (
    <div
      className={classes("relative select-none overflow-hidden", atLimit && "opacity-40 grayscale")}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      {/* pointerEvents:none prevents OCGCard's built-in touch modal from firing */}
      <div style={{ pointerEvents: "none" }}>
        <OCGCard
          card={card}
          size="xs"
          overlayText={overlayText}
          shine={false}
          tiltFactor={0}
          scaleFactor={1}
          glareIntensity={0}
        />
      </div>
      {/* Full-coverage overlay owns all touch/click interaction */}
      <div className="absolute inset-0" {...handlers} />
      {/* Long-press ring indicator */}
      {pressing && !atLimit && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="36" height="36" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeDasharray={RING_C}
              opacity="0.9"
              style={{ animation: "longPressRing 0.5s linear forwards" }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export function MobileCardLibrary({
  deck,
  onCardClick,
  onCardPreview,
  onCardsLoaded,
}: MobileCardLibraryProps) {
  const { user, loading: authLoading } = useAuth();
  const { library, loading: libraryLoading } = useLibrary();
  const [fetchGQLCards, { data: gqlData, loading: gqlCardsLoading }] = useGetAllCardsFullLazyQuery();
  const [useFireLibrary, setUseFireLibrary] = useState(true);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { isAtLimit } = useDeckRules(deck);
  const hasLibraryCards = !libraryLoading && Object.keys(library).length > 0;
  const allowSwitch = !!user && hasLibraryCards;

  useEffect(() => {
    if (authLoading || libraryLoading) return;
    fetchGQLCards({ variables: { pageSize: 0 } });
  }, [authLoading, libraryLoading, fetchGQLCards]);

  const fullCardMap = useMemo(() => {
    const map: Record<number, FullCardEntry> = {};
    for (const card of gqlData?.cards.nodes ?? []) map[card.id] = card;
    return map;
  }, [gqlData]);

  useEffect(() => {
    if (gqlData?.cards.nodes) onCardsLoaded?.(gqlData.cards.nodes);
  }, [gqlData, onCardsLoaded]);

  const allCards = useMemo(() => {
    if (authLoading || libraryLoading || gqlCardsLoading) return [];
    if (allowSwitch && useFireLibrary) {
      return Object.values(library).map((e) => fullCardMap[e.cardId]).filter(Boolean);
    }
    return gqlData?.cards.nodes ?? [];
  }, [authLoading, libraryLoading, gqlCardsLoading, allowSwitch, useFireLibrary, library, fullCardMap, gqlData]);

  const tabFilteredCards = useMemo(() => {
    const type = TAB_CARD_TYPE[libraryTab];
    if (!type) return allCards;
    return allCards.filter((c) => c.cardType === type);
  }, [allCards, libraryTab]);

  const filters = useCardLibraryFilters(tabFilteredCards);
  const { scrollRef, rows, virtualizer, gridWidth, gridOffset } = useVirtualGrid(filters.displayCards, {
    itemWidth: CARD_WIDTH,
    itemHeight: CARD_HEIGHT,
    gap: GAP,
  });

  return (
    <Card className="flex flex-col gap-2 w-full flex-1 min-h-0">
      {/* Compact search row */}
      <div className="flex gap-2 shrink-0">
        <Input
          className="flex-1 min-w-0"
          placeholder="Search cards…"
          value={filters.search}
          onChange={(e) => filters.setSearch(e.target.value)}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={() => setShowFilters(true)}
          className={classes(
            "h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ring-1 ring-inset transition-colors ring-black/15 dark:ring-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 relative"
          )}
        >
          <SlidersHorizontalIcon size={14} />
          {filters.hasActiveFilters && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
          )}
        </button>
        {allowSwitch && (
          <Checkbox label="Owned" checked={useFireLibrary} onCheckedChange={setUseFireLibrary} />
        )}
      </div>

      {/* Type tabs */}
      <Tabs value={libraryTab} onValueChange={setLibraryTab} tabs={LIBRARY_TABS} fullWidth className="shrink-0" />

      {/* Card count */}
      <p className="text-xs opacity-40 shrink-0">{filters.displayCards.length} cards</p>

      {/* Virtualized grid */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-1 -mx-1">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: gridOffset,
                width: gridWidth,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="flex gap-2 pb-2"
            >
              {rows[virtualRow.index].map((card) => {
                const deckQty = deck.find((e) => e.card.id === card.id)?.quantity ?? 0;
                const ownedQty = library[card.id]?.quantity ?? 1;
                const atOwnedLimit = useFireLibrary && allowSwitch && deckQty >= ownedQty;
                const atLimit = isAtLimit(card) || atOwnedLimit;
                return (
                  <LibraryCard
                    key={card.id}
                    card={card}
                    atLimit={atLimit}
                    overlayText={useFireLibrary && allowSwitch ? `Owned: ${ownedQty}x` : undefined}
                    onClick={() => onCardClick(card)}
                    onPreview={() => onCardPreview(card)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Filters modal */}
      <Modal title="Sort & Filter" isOpen={showFilters} onClose={() => setShowFilters(false)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Dropdown
              className="flex-1 min-w-[120px]"
              value={filters.sortField}
              onValueChange={(v) => filters.setSortField(v as SortField)}
              items={SORT_ITEMS}
              label="Sort by"
            />
            {filters.filterOptions.colorOptions.length > 1 && (
              <Dropdown multi label="Color" value={filters.colorFilter} onValueChange={filters.setColorFilter} items={filters.filterOptions.colorOptions} className="flex-1 min-w-[120px]" />
            )}
            {filters.filterOptions.bloomOptions.length > 1 && (
              <Dropdown multi label="Bloom" value={filters.bloomFilter} onValueChange={filters.setBloomFilter} items={filters.filterOptions.bloomOptions} className="flex-1 min-w-[120px]" />
            )}
            {filters.filterOptions.rarityOptions.length > 1 && (
              <Dropdown multi label="Rarity" value={filters.rarityFilter} onValueChange={filters.setRarityFilter} items={filters.filterOptions.rarityOptions} className="flex-1 min-w-[120px]" />
            )}
            {filters.filterOptions.tagOptions.length > 0 && (
              <Dropdown multi label="Tags" value={filters.tagsFilter} onValueChange={filters.setTagsFilter} items={filters.filterOptions.tagOptions} className="flex-1 min-w-[120px]" />
            )}
            {filters.filterOptions.supportTypeOptions.length > 1 && (
              <Dropdown multi label="Support Type" value={filters.supportTypeFilter} onValueChange={filters.setSupportTypeFilter} items={filters.filterOptions.supportTypeOptions} className="flex-1 min-w-[120px]" />
            )}
          </div>
          {filters.hasActiveFilters && (
            <Button variant="transparent" highContrast onClick={() => { filters.clearFilters(); setShowFilters(false); }}>
              Clear filters
            </Button>
          )}
        </div>
      </Modal>
    </Card>
  );
}
