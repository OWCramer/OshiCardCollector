"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { CardPreview } from "@/app/(withHeader)/deck-builder/components/CardPreview";
import {
  CardLibrary,
  type FullCardEntry,
} from "@/app/(withHeader)/deck-builder/components/CardLibrary";
import {
  type DeckEntry,
  DeckPreview,
} from "@/app/(withHeader)/deck-builder/components/DeckPreview";
import { maxForCard } from "@/app/(withHeader)/deck-builder/components/useDeckRules";
import { type RawDeckCard, useDeckStorage } from "@/lib/useDeckStorage";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { useLeaveWarning } from "@/lib/useLeaveWarning";
import { MobileDeckBuilder } from "@/app/(withHeader)/deck-builder/components/Mobile";

function DeckBuilderContent() {
  const searchParams = useSearchParams();
  const autoLoadId = searchParams.get("load");
  const hasAutoLoaded = useRef(false);
  const { loadDeck } = useDeckStorage();

  const useSinglePane = !useBreakpoint("xl");
  const [hoveredCard, setHoveredCard] = useState<FullCardEntry | null>(null);
  const [deck, setDeck] = useState<DeckEntry[]>([]);
  const [allCards, setAllCards] = useState<FullCardEntry[]>([]);
  const [loadedDeckId, setLoadedDeckId] = useState<string | undefined>();
  const [loadedDeckName, setLoadedDeckName] = useState<string | undefined>();

  useLeaveWarning(deck.length > 0);

  function handleCardHover(card: FullCardEntry | null) {
    if (card) setHoveredCard(card);
  }

  function addCard(card: FullCardEntry) {
    setDeck((prev) => {
      const existing = prev.find((e) => e.card.id === card.id);
      const qty = existing?.quantity ?? 0;
      if (qty >= maxForCard(card)) return prev;
      if (card.cardType === "OSHI" && prev.some((e) => e.card.cardType === "OSHI")) return prev;
      if (existing) {
        return prev.map((e) => (e.card.id === card.id ? { ...e, quantity: qty + 1 } : e));
      }
      return [...prev, { card, quantity: 1 }];
    });
  }

  function clearDeck() {
    setDeck([]);
  }

  function removeCard(cardId: number) {
    setDeck((prev) => {
      const existing = prev.find((e) => e.card.id === cardId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((e) => e.card.id !== cardId);
      return prev.map((e) => (e.card.id === cardId ? { ...e, quantity: e.quantity - 1 } : e));
    });
  }

  function setCheer(entries: DeckEntry[]) {
    setDeck((prev) => [...prev.filter((e) => e.card.cardType !== "CHEER"), ...entries]);
  }

  function handleLoadDeck(
    rawCards: RawDeckCard[],
    cards: FullCardEntry[] = allCards,
    deckId?: string,
    deckName?: string
  ) {
    const cardMap = new Map(cards.map((c) => [c.id, c]));
    const entries: DeckEntry[] = rawCards
      .map(({ cardId, quantity }) => {
        const card = cardMap.get(cardId);
        return card ? { card, quantity } : null;
      })
      .filter((e): e is DeckEntry => e !== null);
    setDeck(entries);
    setLoadedDeckId(deckId);
    setLoadedDeckName(deckName);
  }

  const handleCardsLoaded = useCallback(
    (cards: FullCardEntry[]) => {
      setAllCards(cards);
      if (autoLoadId && !hasAutoLoaded.current) {
        hasAutoLoaded.current = true;
        loadDeck(autoLoadId)
          .then(({ cards: rawCards, name }) => handleLoadDeck(rawCards, cards, autoLoadId, name))
          .catch((err) => console.error("Failed to auto-load deck:", err));
      }
    },
    // handleLoadDeck is stable (only depends on setDeck/setLoadedDeckId/setLoadedDeckName)
    // autoLoadId is a stable string from searchParams
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [autoLoadId, loadDeck],
  );

  const sharedDeckProps = {
    deck,
    allCards,
    onRemoveCard: removeCard,
    onClearDeck: clearDeck,
    onSetCheer: setCheer,
    onLoadDeck: (rawCards: RawDeckCard[], deckId: string, deckName: string) =>
      handleLoadDeck(rawCards, allCards, deckId, deckName),
    loadedDeckId,
    loadedDeckName,
  };

  if (useSinglePane) {
    return (
      <div className="fixed inset-x-0 top-15.25 bottom-0 overflow-hidden flex flex-col px-2 pt-2 pb-2">
        <MobileDeckBuilder
          deck={deck}
          allCards={allCards}
          onRemoveCard={removeCard}
          onClearDeck={clearDeck}
          onSetCheer={setCheer}
          onLoadDeck={(rawCards, deckId, deckName) =>
            handleLoadDeck(rawCards, allCards, deckId, deckName)
          }
          onCardsLoaded={handleCardsLoaded}
          addCard={addCard}
          loadedDeckId={loadedDeckId}
          loadedDeckName={loadedDeckName}
        />
      </div>
    );
  }

  return (
    <PageContainer className="flex flex-row gap-3 items-start" fullWidth>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <CardPreview card={hoveredCard} />
      </div>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <CardLibrary
          deck={deck}
          onCardHover={handleCardHover}
          onCardClick={addCard}
          onCardsLoaded={handleCardsLoaded}
        />
      </div>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <DeckPreview {...sharedDeckProps} onCardHover={handleCardHover} />
      </div>
    </PageContainer>
  );
}

export default function DeckBuilderPage() {
  return (
    <Suspense>
      <DeckBuilderContent />
    </Suspense>
  );
}
