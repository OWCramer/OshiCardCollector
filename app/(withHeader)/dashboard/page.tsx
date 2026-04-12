"use client";

import { useRef, useState, useEffect } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useAuth } from "@/lib/auth-context";
import { useGetAllCardsQuery } from "@/generated/graphql";
import { ItemCard, CARD_SIZES } from "@/components/Card";

const { width: CARD_WIDTH, height: CARD_HEIGHT } = CARD_SIZES["lg"];
const GAP = 20;

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading } = useGetAllCardsQuery({ variables: { pageSize: 0 } });
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const cols = Math.max(1, Math.floor((entry.contentRect.width + GAP) / (CARD_WIDTH + GAP)));
      setColumns(cols);
      setScrollMargin(el.offsetTop);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cards = data?.cards.nodes ?? [];
  const rowCount = Math.ceil(cards.length / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 5,
    scrollMargin,
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-6 space-y-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome, {user?.displayName}. Your collection dashboard is ready.
        </p>

        <div ref={gridRef} style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columns;
            const rowCards = cards.slice(startIndex, startIndex + columns);
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
                    <ItemCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        )}
      </main>
    </div>
  );
}
