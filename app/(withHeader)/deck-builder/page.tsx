"use client";

import { PageContainer } from "@/components/PageContainer";
import { CardPreview } from "@/app/(withHeader)/deck-builder/components/CardPreview";
import { CardLibrary } from "@/app/(withHeader)/deck-builder/components/CardLibrary";
import { DeckPreview } from "@/app/(withHeader)/deck-builder/components/DeckPreview";
import { useBreakpoint } from "@/lib/useBreakpoint";

export default function DeckBuilderPage() {
  const useSinglePane = !useBreakpoint("xl");

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
        <CardPreview />
      </div>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <CardLibrary />
      </div>
      <div className="flex-1 min-w-0 h-[calc(100dvh-6rem)]">
        <DeckPreview />
      </div>
    </PageContainer>
  );
}
