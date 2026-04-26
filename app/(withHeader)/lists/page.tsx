"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFavorites } from "@/lib/favorites-context";
import { useAuth } from "@/lib/auth-context";
import { useCardMap } from "@/lib/use-card-map";
import { PageLoading } from "@/components/PageLoading";
import { PageContainer } from "@/components/PageContainer";
import pluralize from "pluralize";
import { Accordion } from "@/components/Accordion";
import { OCGCard } from "@/components/OCGCard";
import { Button } from "@/components/Button";
import { ManageListsModal } from "./ManageListsModal";

function ListsContent() {
  const { user, loading: authLoading } = useAuth();
  const { lists, cardsByList, loading: favoritesLoading } = useFavorites();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { cardMap, loading: cardsLoading } = useCardMap(!user);
  const [manageOpen, setManageOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const openIds = useMemo(() => {
    const param = searchParams.get("open");
    if (param === null) return new Set(lists[0] ? [lists[0].id] : []); // fresh visit → open first
    if (param === "") return new Set(); // explicitly closed all
    return new Set(param.split(","));
  }, [searchParams, lists]);

  function toggleList(listId: string) {
    const next = new Set(openIds);
    if (next.has(listId)) {
      next.delete(listId);
    } else {
      next.add(listId);
    }
    const params = new URLSearchParams(searchParams.toString());
    // Always keep the param — empty string means "user closed everything",
    // absent means "fresh visit, use default". Never delete it after first interaction.
    params.set("open", Array.from(next).join(","));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (authLoading || favoritesLoading || cardsLoading) {
    return <PageLoading />;
  }

  if (!user) return null;

  return (
    <PageContainer className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Lists</h1>
          <p className="text-sm opacity-75">
            {lists.length} {pluralize("list", lists.length)}
          </p>
        </div>
        <Button highContrast variant="transparent" onClick={() => setManageOpen(true)}>
          Manage lists
        </Button>
      </div>
      <ManageListsModal isOpen={manageOpen} onClose={() => setManageOpen(false)} />
      {lists.map((list) => (
        <Accordion
          key={list.id}
          title={list.name}
          open={openIds.has(list.id)}
          onOpenChange={() => toggleList(list.id)}
        >
          <div className="grid gap-6 sm:gap-4 md:gap-2 w-fit max-w-full mx-auto grid-cols-[repeat(auto-fill,160px)] mt-3">
            {Object.values(cardsByList[list.id] ?? {}).map((card) => {
              const gqlCard = cardMap[card.cardId];
              if (!gqlCard) return null;
              return <OCGCard key={card.cardId} card={gqlCard} size="sm" goToCard />;
            })}
          </div>
        </Accordion>
      ))}
    </PageContainer>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ListsContent />
    </Suspense>
  );
}
