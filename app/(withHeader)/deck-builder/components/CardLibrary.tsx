"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useMemo, useState } from "react";
import { type GetAllCardsFullQuery, useGetAllCardsFullLazyQuery } from "@/generated/graphql";
import { useLibrary } from "@/lib/library-context";
import { Card } from "@/components/Card";
import { OCG_CARD_SIZES, OCGCard } from "@/components/OCGCard";
import { Checkbox } from "@/components/Checkbox";
import { useCardLibraryFilters } from "./useCardLibraryFilters";
import { CardLibraryControls } from "./CardLibraryControls";
import { useVirtualGrid } from "./useVirtualGrid";

export type FullCardEntry = GetAllCardsFullQuery["cards"]["nodes"][number];

const GAP = 8;
const { width: CARD_WIDTH, height: CARD_HEIGHT } = OCG_CARD_SIZES["xs"];

interface CardLibraryProps {
  onCardHover?: (card: FullCardEntry | null) => void;
  onCardClick?: (card: FullCardEntry) => void;
}

export function CardLibrary({ onCardHover, onCardClick }: CardLibraryProps) {
  const { user, loading: authLoading } = useAuth();
  const { library, loading: libraryLoading } = useLibrary();
  const [fetchGQLCards, { data: gqlData, loading: gqlCardsLoading }] =
    useGetAllCardsFullLazyQuery();
  const [useFireLibrary, setUseFireLibrary] = useState(true);

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

  const cards = useMemo(() => {
    if (authLoading || libraryLoading || gqlCardsLoading) return [];
    if (allowSwitch && useFireLibrary) {
      return Object.values(library)
        .map((entry) => fullCardMap[entry.cardId])
        .filter(Boolean);
    }
    return gqlData?.cards.nodes ?? [];
  }, [
    authLoading,
    libraryLoading,
    gqlCardsLoading,
    allowSwitch,
    useFireLibrary,
    library,
    fullCardMap,
    gqlData,
  ]);

  const filters = useCardLibraryFilters(cards);
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
              {rows[virtualRow.index].map((card) => (
                <OCGCard
                  key={card.id}
                  card={card}
                  size="xs"
                  onHover={(isHovered) => onCardHover?.(isHovered ? card : null)}
                  onClick={() => onCardClick?.(card)}
                  overlayText={
                    useFireLibrary && allowSwitch
                      ? `Owned: ${library[card.id]?.quantity ?? 1}x`
                      : undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
