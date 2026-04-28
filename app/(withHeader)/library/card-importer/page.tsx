"use client";

import { Card } from "@/components/Card";
import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/Input";
import { useVirtualizer } from "@tanstack/react-virtual";
import { OCG_CARD_SIZES, OCGCard } from "@/components/OCGCard";
import { useGetAllCardsQuery } from "@/generated/graphql";

const GAP = 16;
const { width: CARD_WIDTH, height: CARD_HEIGHT } = OCG_CARD_SIZES["sm"];

type CardNode = { id: number; name: string; imageUrl?: string | null; rarity?: string | null };

const VirtualRow = memo(function VirtualRow({ row }: { row: CardNode[] }) {
  return (
    <div className="flex gap-4 pb-4 items-center justify-start">
      {row.map((card) => (
        <OCGCard key={card.id} card={card} size="sm" />
      ))}
    </div>
  );
});

export default function CardImporterPage() {
  const [addedCards, setAddedCards] = useState([]);
  const { data, loading } = useGetAllCardsQuery({ variables: { pageSize: 0 } });
  const allCards = useMemo(() => data?.cards?.nodes ?? [], [data?.cards?.nodes]);

  const scrollParentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = scrollParentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columns = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
  }, [containerWidth]);

  const rows = useMemo(() => {
    const result: CardNode[][] = [];
    for (let i = 0; i < allCards.length; i += columns) {
      result.push(allCards.slice(i, i + columns));
    }
    return result;
  }, [allCards, columns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  return (
    <section aria-label="Card Importer" className="p-6 flex flex-col h-[calc(100dvh-3.8125rem)]">
      <div className="grid grid-cols-2 w-full gap-6 h-full">
        <Card className="w-full h-full flex flex-col gap-2 p-4 pb-0 overflow-hidden">
          <Input className="w-full shrink-0" placeholder="Search cards" />
          <div ref={scrollParentRef} className="overflow-y-scroll min-h-0">
            <div className="flex justify-center">
              <div
                style={{
                  width: columns * CARD_WIDTH + (columns - 1) * GAP,
                  height: totalHeight,
                  position: "relative",
                }}
              >
                {virtualRows.map((virtualRow) => (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className="first:pt-4"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <VirtualRow row={rows[virtualRow.index]} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card className="w-full flex flex-col gap-2 p-4">Test</Card>
      </div>
    </section>
  );
}
