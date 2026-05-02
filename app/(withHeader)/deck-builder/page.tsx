"use client";

import { useState } from "react";
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
import { useBreakpoint } from "@/lib/useBreakpoint";

export default function DeckBuilderPage() {
  const useSinglePane = !useBreakpoint("xl");
  const [hoveredCard, setHoveredCard] = useState<FullCardEntry | null>(null);
  const [deck, setDeck] = useState<DeckEntry[]>([]);

  function handleCardHover(card: FullCardEntry | null) {
    if (card) setHoveredCard(card);
  }

  function addCard(card: FullCardEntry) {
    setDeck((prev) => {
      const existing = prev.find((e) => e.card.id === card.id);
      if (existing) {
        return prev.map((e) => (e.card.id === card.id ? { ...e, quantity: e.quantity + 1 } : e));
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

  if (useSinglePane) {
    return (
      <PageContainer className="flex flex-col justify-evenly">
        <DeckPreview deck={deck} onRemoveCard={removeCard} onClearDeck={clearDeck} />
        <CardLibrary />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-row gap-3 items-start" fullWidth>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <CardPreview card={hoveredCard} />
      </div>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <CardLibrary onCardHover={handleCardHover} onCardClick={addCard} />
      </div>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <DeckPreview
          deck={deck}
          onRemoveCard={removeCard}
          onClearDeck={clearDeck}
          onCardHover={handleCardHover}
        />
      </div>
    </PageContainer>
  );
}
