"use client";

import { use, useCallback } from "react";
import { useGetCardQuery } from "@/generated/graphql";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { OCGCard } from "@/components/OCGCard";
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
import { CardContainer } from "@/components/CardContainer";
import { PageLoading } from "@/components/PageLoading";
import { PageContainer } from "@/components/PageContainer";
import { ArrowLeftIcon } from "lucide-react";
import { LinkedCardText } from "@/components/LinkedCardText";
import { PricingCharts } from "@/app/(withHeader)/card/[slug]/components/PricingCharts";

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

  if (loading) return <PageLoading />;

  if (error || !data?.card) notFound();

  const card = data.card;

  return (
    <div className="flex flex-1 flex-col relative">
      {/* Blurred card image backdrop */}
      {card.imageUrl && (
        <div className="fixed inset-0 z-0 scale-110 select-none pointer-events-none" aria-hidden>
          <Image
            src={card.imageUrl}
            alt={`${card.name} - ${card.cardNumber} image`}
            id={`${card.cardNumber}-image`}
            fill
            className="object-cover object-top sm:object-center blur-3xl saturate-150 opacity-35 dark:opacity-25"
          />
          {/* Fade to bg at the bottom so content stays readable */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        </div>
      )}
      <PageContainer
        leading={
          <Button variant="transparent" highContrast onClick={handleBackPress} icon={ArrowLeftIcon}>
            Back
          </Button>
        }
        trailing={<CardActions cardId={card.id} />}
        className="relative z-10 flex flex-col gap-5"
      >
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8 gap-5">
          {card.imageUrl && (
            <OCGCard
              imageUrl={card.imageUrl}
              name={card.name}
              rarity={card.rarity}
              size="detail"
              parallax
              shine
            />
          )}

          <div className="flex flex-col gap-4 min-w-0 self-stretch flex-1">
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
                <CardContainer>
                  <p className="text-sm opacity-75 whitespace-pre-wrap">
                    <LinkedCardText text={card.extraText} />
                  </p>
                </CardContainer>
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
        <PricingCharts card={card} />
      </PageContainer>
    </div>
  );
}
