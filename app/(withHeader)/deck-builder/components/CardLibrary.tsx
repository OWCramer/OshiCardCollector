"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGetAllCardsLazyQuery } from "@/generated/graphql";
import { useCardMap } from "@/lib/use-card-map";
import { useLibrary } from "@/lib/library-context";
import { Card } from "@/components/Card";
import { OCG_CARD_SIZES, OCGCard, type OCGCardData } from "@/components/OCGCard";
import { Checkbox } from "@/components/Checkbox";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCardLibraryFilters } from "./useCardLibraryFilters";
import { CardLibraryControls } from "./CardLibraryControls";

const GAP = 8;
const { width: CARD_WIDTH, height: CARD_HEIGHT } = OCG_CARD_SIZES["xs"];
const ROW_HEIGHT = CARD_HEIGHT + GAP;

interface CardLibraryProps {
  onCardHover?: (card: OCGCardData | null) => void;
  onCardClick?: (card: OCGCardData) => void;
}

export function CardLibrary({ onCardHover, onCardClick }: CardLibraryProps) {
  const { user, loading: authLoading } = useAuth();
  const { library, loading: libraryLoading } = useLibrary();
  const [fetchGQLCards, { data: gqlData, loading: gqlCardsLoading }] = useGetAllCardsLazyQuery();
  const { cardMap, loading: cardsLoading } = useCardMap(!user);
  const [useFireLibrary, setUseFireLibrary] = useState(true);

  const hasLibraryCards = !libraryLoading && Object.keys(library).length > 0;
  const allowSwitch = !!user && hasLibraryCards;

  useEffect(() => {
    if (authLoading || libraryLoading) return;
    if (!user || !hasLibraryCards || !useFireLibrary) fetchGQLCards({ variables: { pageSize: 0 } });
  }, [authLoading, libraryLoading, user, hasLibraryCards, useFireLibrary, fetchGQLCards]);

  const cards = useMemo(() => {
    if (authLoading || libraryLoading || gqlCardsLoading || cardsLoading) return [];
    if (allowSwitch && useFireLibrary) {
      return Object.values(library)
        .map((entry) => cardMap[entry.cardId])
        .filter(Boolean);
    }
    return gqlData?.cards.nodes ?? [];
  }, [
    authLoading,
    libraryLoading,
    gqlCardsLoading,
    cardsLoading,
    allowSwitch,
    useFireLibrary,
    library,
    cardMap,
    gqlData,
  ]);

  const filters = useCardLibraryFilters(cards);

  // ── virtualizer ────────────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columns = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
  }, [containerWidth]);

  const gridWidth = columns * CARD_WIDTH + (columns - 1) * GAP;
  const gridOffset = Math.max(0, (containerWidth - gridWidth) / 2);

  const rows = useMemo(() => {
    const result: (typeof filters.displayCards)[number][][] = [];
    for (let i = 0; i < filters.displayCards.length; i += columns) {
      result.push(filters.displayCards.slice(i, i + columns));
    }
    return result;
  }, [filters.displayCards, columns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
    getScrollElement: () => scrollRef.current,
  });

  return (
    <Card className="flex flex-col gap-2 w-full h-full">
      <div className="flex flex-row justify-between">
        <h2>Available Cards</h2>
        {allowSwitch && (
          <Checkbox
            label="Only show owned cards"
            checked={useFireLibrary}
            onCheckedChange={setUseFireLibrary}
          />
        )}
      </div>

      <CardLibraryControls {...filters} />

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 -mx-2">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
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
                {row.map((card) => (
                  <OCGCard
                    onHover={(isHovered) => onCardHover?.(isHovered ? card : null)}
                    onClick={() => onCardClick?.(card)}
                    size="xs"
                    key={card.id}
                    card={card}
                    overlayText={
                      useFireLibrary && allowSwitch
                        ? `Owned: ${library[card.id]?.quantity ?? 1}x`
                        : undefined
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
