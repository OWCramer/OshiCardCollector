"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGetAllCardsQuery } from "@/generated/graphql";
import { ItemCard, CARD_SIZES, type CardSize } from "@/components/Card";
import { useBreakpoint } from "@/lib/useBreakpoint";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, fetchMore } = useGetAllCardsQuery({ variables: { page: 1, pageSize: 100 } });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingMore = useRef(false);

  const isSm = useBreakpoint("sm");
  const isLg = useBreakpoint("lg");
  const isXl = useBreakpoint("xl");

  const size: CardSize = isXl ? "xl" : isLg ? "lg" : isSm ? "md" : "sm";
  const cardWidth = CARD_SIZES[size].width;

  const pageInfo = data?.cards.pageInfo;

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && pageInfo?.hasNextPage && !isFetchingMore.current) {
        isFetchingMore.current = true;
        fetchMore({ variables: { page: pageInfo.currentPage + 1 } }).finally(() => {
          isFetchingMore.current = false;
        });
      }
    }, { rootMargin: "800px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [pageInfo, fetchMore]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-6 space-y-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome, {user?.displayName}. Your collection dashboard is ready.
        </p>

        <div
          className="grid gap-5 justify-center"
          style={{ gridTemplateColumns: `repeat(auto-fill, ${cardWidth}px)` }}
        >
          {data?.cards.nodes.map((card) => (
            <ItemCard key={card.id} card={card} size={size} />
          ))}
        </div>

        <div ref={sentinelRef} className="h-1" />

        {loading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        )}
      </main>
    </div>
  );
}
