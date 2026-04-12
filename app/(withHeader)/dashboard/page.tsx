"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGetAllCardsQuery } from "@/lib/generated/graphql";
import { ItemCard } from "@/components/Card";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, fetchMore } = useGetAllCardsQuery({ variables: { page: 1 } });
  const sentinelRef = useRef<HTMLDivElement>(null);

  const pageInfo = data?.cards.pageInfo;

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && pageInfo?.hasNextPage && !loading) {
        fetchMore({ variables: { page: pageInfo.currentPage + 1 } });
      }
    }, { rootMargin: "800px" });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [pageInfo, loading, fetchMore]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-6 space-y-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome, {user?.displayName}. Your collection dashboard is ready.
        </p>

        <div className="flex w-full justify-center">
          <div className="grid grid-cols-5 gap-5 w-2/3">
            {data?.cards.nodes.map((card) => (
              <ItemCard key={card.id} card={card} />
            ))}
          </div>
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
