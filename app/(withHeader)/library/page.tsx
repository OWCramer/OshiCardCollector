"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/lib/library-context";
import { useAuth } from "@/lib/auth-context";
import { useCardMap } from "@/lib/use-card-map";
import { PageContainer } from "@/components/PageContainer";
import { PageLoading } from "@/components/PageLoading";
import { Dropdown } from "@/components/Dropdown";
import { Accordion } from "@/components/Accordion";
import { Tabs } from "@/components/Tabs";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { classes } from "@/lib/classes";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  FilterIcon,
  LayoutListIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import pluralize from "pluralize";
import Fuse from "fuse.js";
import { CardGrid } from "./components/CardGrid";
import { FilterPanel } from "./components/FilterPanel";
import { useLibraryFilters } from "./components/useLibraryFilters";
import { BLOOM_ORDER, BREAKDOWN_TABS, type CardEntry, SORT_ITEMS, } from "./components/types";
import { formatGroupKey, getGroupKey, sortEntries, sortGroupKeys } from "./components/utils";

const ICON_BTN = "h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ring-1 ring-inset transition-colors";
const ICON_BTN_IDLE = "ring-black/15 dark:ring-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10";
const ICON_BTN_ACTIVE = "ring-zinc-900 dark:ring-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900";

const SEARCH_INPUT_PROPS = {
  autoCorrect: "off", autoCapitalize: "off", autoComplete: "off", spellCheck: false,
} as const;

export default function LibraryPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LibraryContent />
    </Suspense>
  );
}

function LibraryContent() {
  const { user, loading: authLoading } = useAuth();
  const { library, loading: libraryLoading } = useLibrary();
  const router = useRouter();
  const { cardMap, loading: cardsLoading } = useCardMap(!user);
  const isMedium = useBreakpoint("md");

  const {
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
    resetPage,
  } = useLibraryFilters();

  const [showFilters, setShowFilters]               = useState(false);
  const [showMobileFilters, setShowMobileFilters]   = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const entries       = useMemo(() => Object.values(library), [library]);
  const totalQuantity = useMemo(() => entries.reduce((sum, e) => sum + e.quantity, 0), [entries]);

  const cardEntries = useMemo<CardEntry[]>(
    () => entries.flatMap((entry) => {
      const card = cardMap[entry.cardId];
      return card ? [{ card, entry }] : [];
    }),
    [entries, cardMap]
  );

  const colorOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => card.colors.forEach((c) => s.add(c)));
    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  const typeOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => s.add(card.cardType));
    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  const bloomOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => { if (card.bloomLevel) s.add(card.bloomLevel); });
    return Array.from(s)
      .sort((a, b) => (BLOOM_ORDER[a] ?? 99) - (BLOOM_ORDER[b] ?? 99))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  const rarityOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => s.add(card.rarity));
    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  const tagOptions = useMemo(() => {
    const s = new Set<string>();
    cardEntries.forEach(({ card }) => card.tags.forEach((t) => s.add(t)));
    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: v }));
  }, [cardEntries]);

  const activeFilterCount = useMemo(
    () =>
      colorFilter.length +
      typeFilter.length +
      bloomFilter.length +
      rarityFilter.length +
      tagsFilter.length +
      (specialFilter === "all" ? 0 : 1),
    [colorFilter, typeFilter, bloomFilter, rarityFilter, tagsFilter, specialFilter]
  );

  const fuse = useMemo(
    () => new Fuse(cardEntries, {
      keys: ["card.name", "card.cardNumber", "card.tags", "card.specialText", "card.extraText"],
      threshold: 0.35,
      ignoreLocation: true,
      ignoreDiacritics: true,
      shouldSort: false,
      useExtendedSearch: true,
    }),
    [cardEntries]
  );

  const sorted = useMemo(
    () => sortEntries(cardEntries, sortField, sortOrder),
    [cardEntries, sortField, sortOrder]
  );

  const afterSearch = useMemo(() => {
    const q = search.trim();
    if (!q) return sorted;
    const matchIds = new Set(fuse.search(q).map((r) => r.item.card.id));
    return sorted.filter(({ card }) => matchIds.has(card.id));
  }, [fuse, search, sorted]);

  const filtered = useMemo(() => {
    let result = afterSearch;
    if (colorFilter.length)   result = result.filter(({ card }) => card.colors.some((c) => colorFilter.includes(c)));
    if (typeFilter.length)    result = result.filter(({ card }) => typeFilter.includes(card.cardType));
    if (bloomFilter.length)   result = result.filter(({ card }) => !!card.bloomLevel && bloomFilter.includes(card.bloomLevel));
    if (rarityFilter.length)  result = result.filter(({ card }) => rarityFilter.includes(card.rarity));
    if (tagsFilter.length)   result = result.filter(({ card }) => tagsFilter.some((t) => card.tags.includes(t)));
    if (specialFilter === "buzz")    result = result.filter(({ card }) => card.isBuzz);
    if (specialFilter === "limited") result = result.filter(({ card }) => card.isLimited);
    return result;
  }, [afterSearch, colorFilter, typeFilter, bloomFilter, rarityFilter, tagsFilter, specialFilter]);

  const { groups, groupKeys } = useMemo(() => {
    const map = new Map<string, CardEntry[]>();
    for (const e of filtered) {
      const key = getGroupKey(e.card, breakdown);
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(e);
    }
    return { groups: map, groupKeys: sortGroupKeys(Array.from(map.keys()), breakdown) };
  }, [filtered, breakdown]);

  if (authLoading || libraryLoading || cardsLoading) return <PageLoading />;
  if (!user) return null;

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-center px-4">
        <div>
          <p className="text-lg font-semibold">Your library is empty</p>
          <p className="text-sm opacity-75 mt-1">
            <Link href="/all-cards" className="underline underline-offset-2">Browse cards</Link>{" "}
            and hit + to add them.
          </p>
        </div>
      </div>
    );
  }

  const holoDexCount = Object.values(cardMap).length;
  const filterPanelActive = showFilters || activeFilterCount > 0;
  const hasActiveState = activeFilterCount > 0 || search.trim().length > 0;
  const emptyFiltered = filtered.length === 0 && hasActiveState;
  const isPageDirty = hasActiveState || breakdown !== "none" || sortField !== "name" || sortOrder !== "asc";

  const filterPanelProps = {
    colorOptions, typeOptions, bloomOptions, rarityOptions, tagOptions,
    colorFilter, setColorFilter,
    typeFilter, setTypeFilter,
    bloomFilter, setBloomFilter,
    rarityFilter, setRarityFilter,
    tagsFilter, setTagsFilter,
    specialFilter, setSpecialFilter,
  };

  const sortToggle = (
    <button
      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      title={sortOrder === "asc" ? "Ascending" : "Descending"}
      className={classes(ICON_BTN, ICON_BTN_IDLE)}
    >
      {sortOrder === "asc" ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
    </button>
  );

  function renderCards() {
    if (emptyFiltered) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center opacity-50">
          <SearchIcon size={32} />
          <p className="text-lg font-medium">No cards match</p>
          <p className="text-sm">Try adjusting your filters or search</p>
        </div>
      );
    }
    if (breakdown === "none") {
      return <CardGrid entries={filtered} />;
    }
    return (
      <div className="flex flex-col gap-3">
        {groupKeys.map((key) => (
          <Accordion
            key={key}
            defaultOpen
            title={
              <span className="flex items-center gap-2">
                {formatGroupKey(key, breakdown)}
                <span className="text-xs opacity-50 font-normal">
                  {(groups.get(key) ?? []).length} {pluralize("card", (groups.get(key) ?? []).length)}
                </span>
              </span>
            }
          >
            <CardGrid entries={groups.get(key) ?? []} />
          </Accordion>
        ))}
      </div>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-3 pb-24 md:pb-0">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold">Library</h1>
        <p className="text-sm opacity-50">
          {entries.length} unique {pluralize("card", entries.length)} · {totalQuantity} total ·{" "}
          HoloDex {((entries.length / holoDexCount) * 100).toFixed(3)}%
        </p>
      </div>

      {isMedium && (
        <>
          <div className="flex items-center justify-between gap-x-4 gap-y-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <LayoutListIcon size={14} className="opacity-30 shrink-0" />
              <div className="overflow-x-auto">
                <Tabs value={breakdown} onValueChange={setBreakdown} tabs={BREAKDOWN_TABS} />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDownIcon size={14} className="opacity-30 shrink-0" />
              <Dropdown value={sortField} onValueChange={setSortField} items={SORT_ITEMS} className="w-36" />
              {sortToggle}

              <button
                onClick={() => setShowFilters((v) => !v)}
                title="Filters"
                className={classes(ICON_BTN, filterPanelActive ? ICON_BTN_ACTIVE : ICON_BTN_IDLE, "relative")}
              >
                <SlidersHorizontalIcon size={14} />
                {activeFilterCount > 0 && !showFilters && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] flex items-center justify-center font-bold ring-2 ring-background">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {filterPanelActive && <FilterPanel {...filterPanelProps} />}

          <div className="flex items-center gap-2">
            <Input
              className="flex-1"
              placeholder="Search cards…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              {...SEARCH_INPUT_PROPS}
            />
            {isPageDirty && (
              <Button variant="transparent" highContrast onClick={resetPage}>Reset</Button>
            )}
          </div>
        </>
      )}

      {renderCards()}

      {!isMedium && (
        <div className="fixed bottom-6 left-4 right-4 flex flex-row gap-4 bg-white/50 dark:bg-black/50 backdrop-blur ring-1 ring-inset ring-black/10 dark:ring-white/15 rounded-lg p-4 z-10">
          <Input
            className="flex-1 min-w-0"
            placeholder="Search cards…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            {...SEARCH_INPUT_PROPS}
          />
          {isPageDirty && (
            <Button variant="transparent" highContrast onClick={resetPage}>Reset</Button>
          )}
          <Button
            variant="transparent"
            highContrast
            icon={FilterIcon}
            onClick={() => setShowMobileFilters(true)}
          />
        </div>
      )}

      <Modal title="Filters" isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm opacity-75">Group by</span>
            <div className="overflow-x-auto">
              <Tabs value={breakdown} onValueChange={setBreakdown} tabs={BREAKDOWN_TABS} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm opacity-75">Sort by</span>
            <div className="flex items-center gap-2">
              <Dropdown value={sortField} onValueChange={setSortField} items={SORT_ITEMS} className="flex-1 min-w-0" />
              {sortToggle}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm opacity-75">Filter</span>
            <FilterPanel {...filterPanelProps} />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
