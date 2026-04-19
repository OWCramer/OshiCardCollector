"use client";

import { use, useCallback } from "react";
import { useGetCardQuery } from "@/generated/graphql";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { CardImage } from "./components/CardImage";
import { CardHeader } from "./components/CardHeader";
import { CardStats } from "./components/CardStats";
import { ArtsList } from "./components/ArtsList";
import { OshiSkillsList } from "./components/OshiSkillsList";
import { KeywordsList } from "./components/KeywordsList";
import { QnaList } from "./components/QnaList";
import { SetList } from "./components/SetList";
import { CardMeta } from "./components/CardMeta";
import { CardActions } from "./components/CardActions";
import { Button } from "@/components/Button";
import { ArrowLeftIcon } from "lucide-react";
import { LinkedCardText } from "@/components/LinkedCardText";

export default function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const id = Number.parseInt(slug);
  const { data, loading, error } = useGetCardQuery({ variables: { id } });

  const router = useRouter();

  const handleBackPress = useCallback(() => {
    if (globalThis.history.length === 1) {
      return router.push("/all-cards");
    }
    router.back();
  }, [router]);

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    );

  if (error || !data?.card) notFound();

  const card = data.card;

  return (
    <div className="flex flex-1 flex-col relative">
      {/* Blurred card image backdrop */}
      {card.imageUrl && (
        <div className="fixed inset-0 z-0 scale-110" aria-hidden>
          <Image
            src={card.imageUrl}
            alt=""
            fill
            className="object-cover object-top sm:object-center blur-3xl saturate-150 opacity-35 dark:opacity-25"
          />
          {/* Fade to bg at the bottom so content stays readable */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-zinc-50 dark:to-black" />
        </div>
      )}
      <div className="relative z-20 flex items-center justify-between px-4 pt-2 mt-2 mb-2 xl:mb-0">
        <Button
          variant="transparent"
          highContrast
          onClick={handleBackPress}
          icon={ArrowLeftIcon}
          className="xl:absolute xl:top-2 xl:left-4"
        >
          Back
        </Button>
        <CardActions cardId={card.id} className="xl:absolute xl:top-2 xl:right-4" />
      </div>
      <main className="relative z-10 flex-1 pb-8 xl:pt-4 pt-2 px-4 max-w-4xl mx-auto w-full flex flex-col gap-5">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8 gap-5">
          {card.imageUrl && (
            <CardImage imageUrl={card.imageUrl} name={card.name} rarity={card.rarity} />
          )}

          <div className="flex flex-col gap-4 min-w-0 self-stretch">
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
            />

            {card.specialText && (
              <p
                aria-label="Special/Ability Text"
                className="text-sm opacity-75 whitespace-pre-wrap"
              >
                <LinkedCardText text={card.specialText} />
              </p>
            )}

            <KeywordsList keywords={card.keywords} />
            <ArtsList arts={card.arts} />
            <OshiSkillsList oshiSkills={card.oshiSkills} />

            {card.extraText && (
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold opacity-80">Extra</h2>
                <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3">
                  <p className="text-sm opacity-75 whitespace-pre-wrap">
                    <LinkedCardText text={card.extraText} />
                  </p>
                </div>
              </div>
            )}
            <CardMeta
              className="mt-auto"
              illustrator={card.illustrator}
              releaseDate={card.releaseDate}
              setNames={card.setNames}
            />
          </div>
        </div>
        <SetList setNames={card.setNames} />
        <QnaList qna={card.qna ?? []} />
      </main>
    </div>
  );
}
