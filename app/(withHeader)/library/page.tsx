"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/lib/library-context";
import { useAuth } from "@/lib/auth-context";
import { useCardMap } from "@/lib/use-card-map";
import { PageContainer } from "@/components/PageContainer";
import { PageLoading } from "@/components/PageLoading";
import { OCGCard } from "@/components/OCGCard";

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const { library, loading: libraryLoading } = useLibrary();
  const router = useRouter();

  const { cardMap, loading: cardsLoading } = useCardMap(!user);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || libraryLoading || cardsLoading) {
    return <PageLoading />;
  }

  if (!user) return null;

  const entries = Object.values(library);

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-center px-4">
        <div>
          <p className="text-lg font-semibold">Your library is empty</p>
          <p className="text-sm text-zinc-500 mt-1">
            <Link href="/all-cards" className="underline underline-offset-2">
              Browse cards
            </Link>{" "}
            and hit + to add them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageContainer className="max-w-6xl">
      <h1 className="text-xl font-semibold mb-1">Library</h1>
      <p className="text-sm text-zinc-500 mb-6">
        {entries.length} card{entries.length !== 1 ? "s" : ""}
      </p>
      <div className="flex flex-wrap gap-4">
        {entries.map((entry) => {
          const card = cardMap[entry.cardId];
          if (!card) return null;
          return (
            <div key={entry.cardId} className="shrink-0">
              <div className="relative" style={{ width: 160, height: 224 }}>
                <OCGCard card={card} size="sm" goToCard />
                {!card.imageUrl && (
                  <div className="w-40 h-56 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                )}
                {entry.quantity > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded-md tabular-nums pointer-events-none">
                    ×{entry.quantity}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 truncate w-40">
                {card.name}
              </p>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
