"use client";

import { useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { CardPreview } from "@/app/(withHeader)/deck-builder/components/CardPreview";
import { CardLibrary } from "@/app/(withHeader)/deck-builder/components/CardLibrary";
import { DeckPreview } from "@/app/(withHeader)/deck-builder/components/DeckPreview";
import { useBreakpoint } from "@/lib/useBreakpoint";
import type { OCGCardData } from "@/components/OCGCard";

export default function DeckBuilderPage() {
  const useSinglePane = !useBreakpoint("xl");
  const [hoveredCard, setHoveredCard] = useState<OCGCardData | null>(null);
  const [clickedCard, setClickedCard] = useState<OCGCardData | null>(null);
  function handleCardHover(card: OCGCardData | null) {
    if (card) setHoveredCard(card);
  }

  if (useSinglePane) {
    return (
      <PageContainer className="flex flex-col justify-evenly">
        <DeckPreview />
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
        <CardLibrary onCardHover={handleCardHover} onCardClick={setClickedCard} />
      </div>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <DeckPreview card={clickedCard} />
      </div>
    </PageContainer>
  );
}
