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
    <PageContainer className="flex flex-row justify-evenly gap-3" fullWidth>
      <CardPreview />
      <CardLibrary />
      <DeckPreview />
    </PageContainer>
  );
}
