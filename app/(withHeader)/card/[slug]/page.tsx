"use client";

import { use } from "react";
import { useGetCardQuery } from "@/generated/graphql";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CardImage } from "./components/CardImage";
import { CardHeader } from "./components/CardHeader";
import { CardStats } from "./components/CardStats";
import { ArtsList } from "./components/ArtsList";
import { OshiSkillsList } from "./components/OshiSkillsList";
import { QnaList } from "./components/QnaList";
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
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black relative overflow-hidden">
      {/* Blurred card image backdrop */}
      {card.imageUrl && (
        <div className="fixed inset-0 z-0 scale-110" aria-hidden>
          <Image
            src={card.imageUrl}
            alt=""
            fill
            className="object-cover object-top sm:object-center blur-3xl saturate-150 opacity-20 dark:opacity-15"
          />
          {/* Fade to bg at the bottom so content stays readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-50 dark:to-black" />
        </div>
      )}
      <main className="relative z-10 flex-1 p-8 max-w-4xl mx-auto w-full flex flex-col gap-4">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-10">
          {card.imageUrl && (
            <CardImage imageUrl={card.imageUrl} name={card.name} rarity={card.rarity} />
          )}

          <div className="flex flex-col gap-4 min-w-0">
            <CardHeader
              cardNumber={card.cardNumber}
              name={card.name}
              cardType={card.cardType}
              colors={card.colors?.length ? card.colors : [card.color]}
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
        <QnaList qna={card.qna ?? []} />
      </main>
    </div>
  );
}
