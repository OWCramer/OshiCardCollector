"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useMemo, useState } from "react";
import { useGetAllCardsLazyQuery } from "@/generated/graphql";
import { useCardMap } from "@/lib/use-card-map";
import { useLibrary } from "@/lib/library-context";
import { Card } from "@/components/Card";
import { OCGCard } from "@/components/OCGCard";
import { Checkbox } from "@/components/Checkbox";

export function CardLibrary() {
  const { user, loading: authLoading } = useAuth();
  const { library, loading: libraryLoading } = useLibrary();
  const [fetchGQLCards, { data: gqlData, loading: gqlCardsLoading }] = useGetAllCardsLazyQuery();
  const { cardMap, loading: cardsLoading } = useCardMap(!user);
  const [useFireLibrary, setUseFireLibrary] = useState(true);

  const hasLibraryCards = !libraryLoading && Object.keys(library).length > 0;
  const allowSwitch = !!user && hasLibraryCards;

  useEffect(() => {
    if (authLoading || libraryLoading) return;
    if (!user || !hasLibraryCards || !useFireLibrary)
      fetchGQLCards({
        variables: { pageSize: 0 },
      });
  }, [authLoading, libraryLoading, user, hasLibraryCards, useFireLibrary, fetchGQLCards]);

  const cards = useMemo(() => {
    if (authLoading || libraryLoading || gqlCardsLoading || cardsLoading) return [];

    const useLibraryCards = allowSwitch && useFireLibrary;

    if (useLibraryCards) {
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

  return (
    <Card className="flex flex-col gap-2 w-full">
      <Checkbox
        label="Only show owned cards"
        checked={allowSwitch ? useFireLibrary : false}
        onCheckedChange={setUseFireLibrary}
        disabled={!allowSwitch}
      />
      <div className="grid gap-5 w-full max-w-full justify-center grid-cols-[repeat(auto-fill,160px)]">
        {cards.map((card) => (
          <OCGCard size={"sm"} key={card.id} card={card} />
        ))}
      </div>
    </Card>
  );
}
