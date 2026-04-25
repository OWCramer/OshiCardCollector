"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/lib/favorites-context";
import { useAuth } from "@/lib/auth-context";
import { useGetCardQuery } from "@/generated/graphql";
import { classes } from "@/lib/classes";

function FavoriteCardItem({ cardId }: { cardId: number }) {
  const { data, loading } = useGetCardQuery({ variables: { id: cardId } });

  if (loading || !data?.card) {
    return <div className="w-40 h-[238px] rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />;
  }

  const card = data.card;

  return (
    <Link href={`/card/${cardId}`} className="w-40 shrink-0">
      <div className="relative rounded-lg overflow-hidden">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            width={160}
            height={224}
            className="object-cover"
          />
        ) : (
          <div className="w-40 h-56 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        )}
      </div>
      <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 truncate">{card.name}</p>
    </Link>
  );
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { lists, cardsByList, loading: favoritesLoading } = useFavorites();
  const router = useRouter();
  const [activeListId, setActiveListId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // Default to first list
  useEffect(() => {
    if (!activeListId && lists.length > 0) setActiveListId(lists[0].id);
  }, [lists, activeListId]);

  // If active list was deleted, fall back to first
  useEffect(() => {
    if (activeListId && lists.length > 0 && !lists.find((l) => l.id === activeListId)) {
      setActiveListId(lists[0].id);
    }
  }, [lists, activeListId]);

  if (authLoading || favoritesLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    );
  }

  if (!user) return null;

  const currentList = lists.find((l) => l.id === activeListId) ?? lists[0];
  const entries = currentList ? Object.values(cardsByList[currentList.id] ?? {}) : [];

  return (
    <main className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
      <h1 className="text-xl font-semibold mb-4">Lists</h1>

      {lists.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {lists.map((list) => {
            const isActive = list.id === (currentList?.id ?? null);
            const count = Object.keys(cardsByList[list.id] ?? {}).length;
            return (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={classes(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
              >
                {list.name}
                <span
                  className={classes("text-xs tabular-nums", isActive ? "opacity-60" : "text-zinc-400")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center py-16">
          <div>
            <p className="text-lg font-semibold">No cards in this list</p>
            <p className="text-sm text-zinc-500 mt-1">
              <Link href="/all-cards" className="underline underline-offset-2">
                Browse cards
              </Link>{" "}
              and hit ♥ to save them here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-zinc-500 mb-4">
            {entries.length} card{entries.length === 1 ? "" : "s"}
          </p>
          <div className="flex flex-wrap gap-4">
            {entries.map((entry) => (
              <FavoriteCardItem key={entry.cardId} cardId={entry.cardId} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
