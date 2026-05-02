"use client";

import { Card } from "@/components/Card";
import { OCGCard } from "@/components/OCGCard";
import { type FullCardEntry } from "./CardLibrary";
import { CardHeader } from "./preview/CardHeader";
import { CardStats } from "./preview/CardStats";
import { ArtsList } from "./preview/ArtsList";
import { OshiSkillsList } from "./preview/OshiSkillsList";
import { KeywordsList } from "./preview/KeywordsList";
import { CardMeta } from "@/app/(withHeader)/deck-builder/components/preview/CardMeta";

interface CardPreviewProps {
  card?: FullCardEntry | null;
}

export function CardPreview({ card }: CardPreviewProps) {
  if (!card) {
    return (
      <Card className="flex text-2xl font-semibold justify-center items-center w-full h-full">
        Hover over a card to see details!
      </Card>
    );
  }

  return (
    <Card className="flex flex-col w-full h-full overflow-y-auto overscroll-contain gap-4 px-3">
      <div className="flex flex-row gap-4">
        <OCGCard
          className="shrink-0 self-start"
          card={card}
          size="sm"
          scaleFactor={1}
          tiltFactor={0}
          glareIntensity={0}
        />
        <div className="flex flex-col gap-2">
          <CardHeader
            cardNumber={card.cardNumber}
            name={card.name}
            cardType={card.cardType}
            colors={card.colors?.length ? card.colors : [card.color]}
            rarity={card.rarity}
            isBuzz={card.isBuzz}
            isLimited={card.isLimited}
            tags={card.tags}
          />
          <CardStats
            hp={card.hp}
            life={card.life}
            bloomLevel={card.bloomLevel}
            batonPass={card.batonPass}
            supportType={card.supportType}
          />
        </div>
      </div>
      {card.specialText && (
        <p className="text-sm opacity-75 whitespace-pre-wrap">{card.specialText}</p>
      )}
      <KeywordsList keywords={card.keywords} />
      <ArtsList arts={card.arts} />
      <OshiSkillsList oshiSkills={card.oshiSkills} />
      {card.extraText && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold opacity-80">Extra</h2>
          <Card>
            <p className="text-sm opacity-75 whitespace-pre-wrap">{card.extraText}</p>
          </Card>
        </div>
      )}
      <CardMeta className="mt-auto" illustrator={card.illustrator} releaseDate={card.releaseDate} />
    </Card>
  );
}
