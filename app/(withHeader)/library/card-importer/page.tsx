"use client";

import { Card } from "@/components/Card";
import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/Input";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGetAllCardsQuery } from "@/generated/graphql";
import { OCGCard } from "@/components/OCGCard";
import { Loader2Icon } from "lucide-react";

const ROW_HEIGHT = 72;

export default function CardImporterPage() {
  const [addedCards, setAddedCards] = useState([]);
  const { data, loading } = useGetAllCardsQuery({ variables: { pageSize: 0 } });
  const cards = useMemo(() => data?.cards?.nodes ?? [], [data?.cards?.nodes]);

  const scrollParentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <section aria-label="Card Importer" className="p-6 flex flex-col h-[calc(100dvh-3.8125rem)]">
      <div className="flex flex-row w-full gap-6 h-full">
        <Card className="w-full h-full flex flex-col gap-2 p-4 overflow-hidden">
          <Input className="w-full shrink-0" placeholder="Search cards" />
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2Icon className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div ref={scrollParentRef} className="overflow-y-scroll min-h-0">
              <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                {virtualItems.map((virtualItem) => {
                  const card = cards[virtualItem.index];
                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={virtualizer.measureElement}
                      className="absolute left-0 top-0 w-full"
                      style={{ transform: `translateY(${virtualItem.start}px)` }}
                    >
                      <div className="h-62.5 border-b border-black/10 dark:border-white/10 flex items-center gap-3 px-2">
                        <OCGCard card={card} size="sm" />
                        <span className="text-sm font-medium">{card.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
        <Card className="w-full flex flex-col gap-2 p-4">Test</Card>
      </div>
    </section>
  );
}
