"use client";

import { use } from "react";
import { useGetCardQuery } from "@/generated/graphql";
import { notFound } from "next/navigation";
import { CardImage } from "./components/CardImage";
import { CardHeader } from "./components/CardHeader";
import { CardStats } from "./components/CardStats";
import { ArtsList } from "./components/ArtsList";
import { OshiSkillsList } from "./components/OshiSkillsList";
import { CardMeta } from "./components/CardMeta";

export default function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const id = Number.parseInt(slug);
  const { data, loading, error } = useGetCardQuery({ variables: { id } });

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    );

  if (error || !data?.card) notFound();

  const card = data.card;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="flex gap-10">
          {card.imageUrl && (
            <CardImage imageUrl={card.imageUrl} name={card.name} rarity={card.rarity} />
          )}

          <div className="flex flex-col gap-4 min-w-0">
            <CardHeader
              cardNumber={card.cardNumber}
              name={card.name}
              cardType={card.cardType}
              color={card.color}
              rarity={card.rarity}
              isBuzz={card.isBuzz}
              isLimited={card.isLimited}
            />

            <CardStats
              hp={card.hp}
              life={card.life}
              bloomLevel={card.bloomLevel}
              batonPass={card.batonPass}
            />

            {card.extraText && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">{card.extraText}</p>
            )}
            {card.specialText && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{card.specialText}</p>
            )}

            <ArtsList arts={card.arts} />
            <OshiSkillsList oshiSkills={card.oshiSkills} />

            <CardMeta
              illustrator={card.illustrator}
              releaseDate={card.releaseDate}
              setNames={card.setNames}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
