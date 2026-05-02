"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useMemo, useState } from "react";
import { type GetAllCardsFullQuery, useGetAllCardsFullLazyQuery } from "@/generated/graphql";
import { useLibrary } from "@/lib/library-context";
import { Card } from "@/components/Card";
import { OCG_CARD_SIZES, OCGCard } from "@/components/OCGCard";
import { Checkbox } from "@/components/Checkbox";
import { Tabs, type Tab } from "@/components/Tabs";
import { useCardLibraryFilters } from "./useCardLibraryFilters";
import { CardLibraryControls } from "./CardLibraryControls";
import { useVirtualGrid } from "./useVirtualGrid";
import { useDeckRules } from "./useDeckRules";
import { type DeckEntry } from "./DeckPreview";

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
  oshi: "OSHI",
  holomem: "HOLOMEM",
  cheer: "CHEER",
  support: "SUPPORT",
};

const GAP = 8;
const { width: CARD_WIDTH, height: CARD_HEIGHT } = OCG_CARD_SIZES["xs"];

interface CardLibraryProps {
  deck: DeckEntry[];
  onCardHover?: (card: FullCardEntry | null) => void;
  onCardClick?: (card: FullCardEntry) => void;
  onCardsLoaded?: (cards: FullCardEntry[]) => void;
}

export function CardLibrary({ deck, onCardHover, onCardClick, onCardsLoaded }: CardLibraryProps) {
  const { user, loading: authLoading } = useAuth();
  const { library, loading: libraryLoading } = useLibrary();
  const [fetchGQLCards, { data: gqlData, loading: gqlCardsLoading }] =
    useGetAllCardsFullLazyQuery();
  const [useFireLibrary, setUseFireLibrary] = useState(true);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("all");

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
      return Object.values(library)
        .map((entry) => fullCardMap[entry.cardId])
        .filter(Boolean);
    }
    return gqlData?.cards.nodes ?? [];
  }, [authLoading, libraryLoading, gqlCardsLoading, allowSwitch, useFireLibrary, library, fullCardMap, gqlData]);

  // Apply tab filter before passing into the filters hook so options stay scoped
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
    <Card className="flex flex-col gap-2 w-full h-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold">Cards</h2>
          <span className="text-sm opacity-50">{filters.displayCards.length} available</span>
        </div>
        {allowSwitch && (
          <Checkbox
            label="Only show owned"
            checked={useFireLibrary}
            onCheckedChange={setUseFireLibrary}
          />
        )}
      </div>

      <Tabs value={libraryTab} onValueChange={setLibraryTab} tabs={LIBRARY_TABS} fullWidth className="shrink-0" />

      <CardLibraryControls {...filters} />

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 -mx-2">
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
                  <OCGCard
                    key={card.id}
                    card={card}
                    size="xs"
                    onHover={(isHovered) => onCardHover?.(isHovered ? card : null)}
                    onClick={atLimit ? undefined : () => onCardClick?.(card)}
                    className={atLimit ? "opacity-40 grayscale" : undefined}
                    overlayText={
                      useFireLibrary && allowSwitch
                        ? `Owned: ${ownedQty}x`
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
