"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/lib/favorites-context";
import { useAuth } from "@/lib/auth-context";
import { useGetCardQuery } from "@/generated/graphql";

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
  const { favorites, loading: favoritesLoading } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || favoritesLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    );
  }

  if (!user) return null;

  const entries = Object.values(favorites);

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-center px-4">
        <div>
          <p className="text-lg font-semibold">No favorites yet</p>
          <p className="text-sm text-zinc-500 mt-1">
            <Link href="/all-cards" className="underline underline-offset-2">
              Browse cards
            </Link>{" "}
            and hit ♥ to save them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
      <h1 className="text-xl font-semibold mb-1">Favorites</h1>
      <p className="text-sm text-zinc-500 mb-6">
        {entries.length} card{entries.length !== 1 ? "s" : ""}
      </p>
      <div className="flex flex-wrap gap-4">
        {entries.map((entry) => (
          <FavoriteCardItem key={entry.cardId} cardId={entry.cardId} />
        ))}
      </div>
    </main>
  );
}
