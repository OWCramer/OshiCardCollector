"use client";

import { OCGCard, OCG_CARD_SIZES, type OCGCardSize } from "@/components/OCGCard";
import type { GetAllCardsQuery } from "@/generated/graphql";

type CardNode = GetAllCardsQuery["cards"]["nodes"][number];

// Re-export so existing importers of CARD_SIZES / CardSize keep working
export const CARD_SIZES = OCG_CARD_SIZES;
export type CardSize = OCGCardSize;

interface ItemCardProps {
  card: CardNode;
  size?: OCGCardSize;
}

export function ItemCard({ card, size = "lg" }: ItemCardProps) {
  if (!card.imageUrl) return null;

  return (
    <OCGCard
      href={`/card/${card.id}`}
      imageUrl={card.imageUrl}
      name={card.name}
      rarity={card.rarity}
      size={size}
      parallax
      shine
    />
  );
}
