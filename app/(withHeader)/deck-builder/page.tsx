"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { CardPreview } from "@/app/(withHeader)/deck-builder/components/CardPreview";
import { CardLibrary, type FullCardEntry } from "@/app/(withHeader)/deck-builder/components/CardLibrary";
import { DeckPreview, type DeckEntry } from "@/app/(withHeader)/deck-builder/components/DeckPreview";
import { maxForCard } from "@/app/(withHeader)/deck-builder/components/useDeckRules";
import { useBreakpoint } from "@/lib/useBreakpoint";

export default function DeckBuilderPage() {
  const useSinglePane = !useBreakpoint("xl");
  const [hoveredCard, setHoveredCard] = useState<FullCardEntry | null>(null);
  const [deck, setDeck] = useState<DeckEntry[]>([]);
  const [allCards, setAllCards] = useState<FullCardEntry[]>([]);

  const cheerOptions = useMemo(
    () => allCards.filter((c) => c.cardType === "CHEER"),
    [allCards]
  );

  function handleCardHover(card: FullCardEntry | null) {
    if (card) setHoveredCard(card);
  }

  function addCard(card: FullCardEntry) {
    setDeck((prev) => {
      const existing = prev.find((e) => e.card.id === card.id);
      const qty = existing?.quantity ?? 0;
      if (qty >= maxForCard(card)) return prev;
      // Block a second oshi even if it's a different card
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

  const sharedDeckProps = {
    deck,
    onRemoveCard: removeCard,
    onClearDeck: clearDeck,
    cheerOptions,
    onSetCheer: setCheer,
  };

  if (useSinglePane) {
    return (
      <PageContainer className="flex flex-col justify-evenly">
        <DeckPreview {...sharedDeckProps} />
        <CardLibrary deck={deck} onCardsLoaded={setAllCards} />
      </PageContainer>
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
          onCardsLoaded={setAllCards}
        />
      </div>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <DeckPreview {...sharedDeckProps} onCardHover={handleCardHover} />
      </div>
    </PageContainer>
  );
}
