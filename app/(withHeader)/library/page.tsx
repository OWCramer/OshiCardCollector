"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/lib/library-context";
import { useAuth } from "@/lib/auth-context";
import { useCardMap } from "@/lib/use-card-map";
import { PageContainer } from "@/components/PageContainer";
import { PageLoading } from "@/components/PageLoading";
import { Dropdown } from "@/components/Dropdown";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { classes } from "@/lib/classes";
import { ArrowDownIcon, ArrowUpIcon, FilterIcon, SearchIcon, SlidersHorizontalIcon, } from "lucide-react";
import pluralize from "pluralize";
import Fuse from "fuse.js";
import { CardGrid } from "./components/CardGrid";
import { FilterPanel } from "./components/FilterPanel";
import { BreakdownSelector } from "./components/BreakdownSelector";
import { GroupedCards } from "./components/NestedCardGroups";
import { useLibraryFilters } from "./components/useLibraryFilters";
import { useLibraryDefaults } from "./components/useLibraryDefaults";
import { useFilterOptions } from "./components/useFilterOptions";
import { sortEntries } from "./components/utils";
import { type CardEntry, FACTORY_DEFAULTS, type LibraryDefaults, SORT_ITEMS, } from "./components/types";

const ICON_BTN =
  "h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ring-1 ring-inset transition-colors";
const ICON_BTN_IDLE =
  "ring-black/15 dark:ring-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10";

const SEARCH_INPUT_PROPS = {
  autoCorrect: "off",
  autoCapitalize: "off",
  autoComplete: "off",
  spellCheck: false,
} as const;

const SCROLL_KEY = "library_scroll_y";

// ── loading shell ─────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const { library, loading: libraryLoading } = useLibrary();
  const router = useRouter();
  const { cardMap, loading: cardsLoading } = useCardMap(!user);
  const {
    defaults,
    loading: defaultsLoading,
    saveDefaults,
  } = useLibraryDefaults(user?.uid ?? null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || libraryLoading || cardsLoading || defaultsLoading) return <PageLoading />;
  if (!user) return null;

  if (Object.keys(library).length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-center px-4">
        <div>
          <p className="text-lg font-semibold">Your library is empty</p>
          <p className="text-sm opacity-75 mt-1">
            <Link href="/all-cards" className="underline underline-offset-2">
              Browse cards
            </Link>{" "}
            and hit + to add them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LibraryView
      library={library}
      cardMap={cardMap}
      defaults={defaults}
      saveDefaults={saveDefaults}
    />
  );
}

// ── main view ─────────────────────────────────────────────────────────────────

interface LibraryViewProps {
  library: Record<number, import("@/api/library").LibraryEntry>;
  cardMap: Record<number, import("@/lib/use-card-map").CardMapEntry>;
  defaults: LibraryDefaults | null;
  saveDefaults: (d: LibraryDefaults) => Promise<void>;
}

function LibraryView({ library, cardMap, defaults, saveDefaults }: LibraryViewProps) {
  const isMedium = useBreakpoint("md");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    function onScroll() {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      sessionStorage.removeItem(SCROLL_KEY);
      requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)));
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const {
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    breakdowns,
    setBreakdowns,
    search,
    setSearch,
    colorFilter,
    setColorFilter,
    typeFilter,
    setTypeFilter,
    bloomFilter,
    setBloomFilter,
    rarityFilter,
    setRarityFilter,
    tagsFilter,
    setTagsFilter,
    specialFilter,
    setSpecialFilter,
    resetPage,
  } = useLibraryFilters(defaults);

  const entries = useMemo(() => Object.values(library), [library]);
  const totalQty = useMemo(() => entries.reduce((s, e) => s + e.quantity, 0), [entries]);
  const holoDexCount = useMemo(() => Object.keys(cardMap).length, [cardMap]);

  const cardEntries = useMemo<CardEntry[]>(
    () =>
      entries.flatMap((entry) => {
        const card = cardMap[entry.cardId];
        return card ? [{ card, entry }] : [];
      }),
    [entries, cardMap]
  );

  const filterOptions = useFilterOptions(cardEntries);

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
    () =>
      new Fuse(cardEntries, {
        keys: ["card.name", "card.cardNumber", "card.tags", "card.specialText", "card.extraText"],
        threshold: 0.35,
        ignoreLocation: true,
        ignoreDiacritics: true,
        shouldSort: false,
        useExtendedSearch: true,
      }),
    [cardEntries]
  );

  const searchQuery = search.trim();

  const sorted = useMemo(
    () => sortEntries(cardEntries, sortField, sortOrder),
    [cardEntries, sortField, sortOrder]
  );

  const afterSearch = useMemo(() => {
    if (!searchQuery) return sorted;
    const matchIds = new Set(fuse.search(searchQuery).map((r) => r.item.card.id));
    return sorted.filter(({ card }) => matchIds.has(card.id));
  }, [fuse, searchQuery, sorted]);

  const filtered = useMemo(() => {
    let r = afterSearch;
    if (colorFilter.length)
      r = r.filter(({ card }) => card.colors.some((c) => colorFilter.includes(c)));
    if (typeFilter.length) r = r.filter(({ card }) => typeFilter.includes(card.cardType));
    if (bloomFilter.length)
      r = r.filter(({ card }) => !!card.bloomLevel && bloomFilter.includes(card.bloomLevel));
    if (rarityFilter.length) r = r.filter(({ card }) => rarityFilter.includes(card.rarity));
    if (tagsFilter.length)
      r = r.filter(({ card }) => tagsFilter.some((t) => card.tags.includes(t)));
    if (specialFilter === "buzz") r = r.filter(({ card }) => card.isBuzz);
    if (specialFilter === "limited") r = r.filter(({ card }) => card.isLimited);
    return r;
  }, [afterSearch, colorFilter, typeFilter, bloomFilter, rarityFilter, tagsFilter, specialFilter]);

  const effectiveDefaults = useMemo(() => defaults ?? FACTORY_DEFAULTS, [defaults]);

  const isDefaultDirty = useMemo(() => {
    const current: LibraryDefaults = {
      sortField,
      sortOrder,
      breakdowns,
      colorFilter,
      typeFilter,
      bloomFilter,
      rarityFilter,
      tagsFilter,
      specialFilter,
    };
    return JSON.stringify(current) !== JSON.stringify(effectiveDefaults);
  }, [
    sortField,
    sortOrder,
    breakdowns,
    colorFilter,
    typeFilter,
    bloomFilter,
    rarityFilter,
    tagsFilter,
    specialFilter,
    effectiveDefaults,
  ]);

  const isPageDirty = isDefaultDirty || searchQuery.length > 0;
  const emptyFiltered = filtered.length === 0 && (activeFilterCount > 0 || searchQuery.length > 0);

  async function handleSaveDefault() {
    const toSave: LibraryDefaults = {
      sortField,
      sortOrder,
      breakdowns,
      colorFilter,
      typeFilter,
      bloomFilter,
      rarityFilter,
      tagsFilter,
      specialFilter,
    };
    await saveDefaults(toSave);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  }

  const filterPanelProps = {
    ...filterOptions,
    colorFilter,
    setColorFilter,
    typeFilter,
    setTypeFilter,
    bloomFilter,
    setBloomFilter,
    rarityFilter,
    setRarityFilter,
    tagsFilter,
    setTagsFilter,
    specialFilter,
    setSpecialFilter,
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

  const filterButton = (
    <button
      onClick={() => setShowFiltersModal(true)}
      title="Filters"
      className={classes(ICON_BTN, ICON_BTN_IDLE, "relative")}
    >
      <SlidersHorizontalIcon size={14} />
      {activeFilterCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
      )}
    </button>
  );

  function renderCards() {
    if (emptyFiltered)
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center opacity-50">
          <SearchIcon size={32} />
          <p className="text-lg font-medium">No cards match</p>
          <p className="text-sm">Try adjusting your filters or search</p>
        </div>
      );
    if (breakdowns.length === 0) return <CardGrid entries={filtered} />;
    return <GroupedCards entries={filtered} breakdowns={breakdowns} />;
  }

  return (
    <PageContainer className="flex flex-col gap-3 pb-24 md:pb-0">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold">Library</h1>
        <p className="text-sm opacity-50">
          {entries.length} unique {pluralize("card", entries.length)} · {totalQty} total · HoloDex{" "}
          {((entries.length / holoDexCount) * 100).toFixed(3)}%
        </p>
      </div>

      {isMedium && (
        <>
          <BreakdownSelector
            breakdowns={breakdowns}
            onChange={setBreakdowns}
            trailing={filterButton}
          />
          <div className="flex items-center gap-2">
            <Input
              className="flex-1"
              placeholder="Search cards…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              {...SEARCH_INPUT_PROPS}
            />
            <Dropdown
              value={sortField}
              onValueChange={setSortField}
              items={SORT_ITEMS}
              className="w-36"
            />
            {sortToggle}
            {(isDefaultDirty || savedFeedback) && (
              <Button variant="transparent" highContrast onClick={handleSaveDefault}>
                {savedFeedback ? "Saved!" : "Set Default"}
              </Button>
            )}
            {isPageDirty && (
              <Button variant="transparent" highContrast onClick={resetPage}>
                Reset
              </Button>
            )}
          </div>
        </>
      )}

      {renderCards()}

      {!isMedium && (
        <div className="fixed bottom-6 left-4 right-4 flex gap-4 bg-white/50 dark:bg-black/50 backdrop-blur ring-1 ring-inset ring-black/10 dark:ring-white/15 rounded-lg p-4 z-10">
          <Input
            className="flex-1 min-w-0"
            placeholder="Search cards…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            {...SEARCH_INPUT_PROPS}
          />
          {isPageDirty && (
            <Button variant="transparent" highContrast onClick={resetPage}>
              Reset
            </Button>
          )}
          <Button
            variant="transparent"
            highContrast
            icon={FilterIcon}
            onClick={() => setShowFiltersModal(true)}
          />
        </div>
      )}

      <Modal title="Filters" isOpen={showFiltersModal} onClose={() => setShowFiltersModal(false)}>
        <div className="flex flex-col gap-4">
          {!isMedium && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-sm opacity-75">Group by</span>
                <BreakdownSelector breakdowns={breakdowns} onChange={setBreakdowns} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm opacity-75">Sort by</span>
                <div className="flex items-center gap-2">
                  <Dropdown
                    value={sortField}
                    onValueChange={setSortField}
                    items={SORT_ITEMS}
                    className="flex-1 min-w-0"
                  />
                  {sortToggle}
                </div>
              </div>
            </>
          )}
          <div className="flex flex-col gap-2">
            <span className="text-sm opacity-75">Filter</span>
            <FilterPanel {...filterPanelProps} />
          </div>
          <div className="flex gap-2">
            {isPageDirty && (
              <Button
                variant="transparent"
                highContrast
                className="flex-1"
                onClick={() => {
                  resetPage();
                  setShowFiltersModal(false);
                }}
              >
                Reset
              </Button>
            )}
            {(isDefaultDirty || savedFeedback) && (
              <Button
                variant="transparent"
                highContrast
                className="flex-1"
                onClick={handleSaveDefault}
              >
                {savedFeedback ? "Saved!" : "Set Default"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
