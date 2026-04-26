"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useGetAllCardsQuery } from "@/generated/graphql";
import { Button } from "@/components/Button";
import { PageContainer } from "@/components/PageContainer";
import { OCGCard } from "@/components/OCGCard";
import { PageLoading } from "@/components/PageLoading";
import { ArrowLeftIcon } from "lucide-react";

export default function SetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const setName = decodeURIComponent(slug);
  const router = useRouter();

  const { data, loading } = useGetAllCardsQuery({
    variables: { filters: { setName }, pageSize: 200 },
  });

  const cards = data?.cards?.nodes ?? [];

  return (
    <PageContainer
      leading={
        <Button variant="transparent" highContrast icon={ArrowLeftIcon} onClick={() => router.back()}>
          Sets
        </Button>
      }
    >

      <h1 className="text-xl font-semibold mb-1">{setName}</h1>
      <p className="text-sm text-zinc-500 mb-6">
        {loading ? "Loading…" : `${cards.length} card${cards.length !== 1 ? "s" : ""}`}
      </p>

      {loading ? (
        <PageLoading />
      ) : (
        <div className="flex flex-wrap gap-4">
          {cards.map((card) => (
            <div key={card.id} className="shrink-0">
              {card.imageUrl ? (
                <OCGCard href={`/card/${card.id}`} imageUrl={card.imageUrl} name={card.name} size="sm" />
              ) : (
                <div className="w-40 h-56 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              )}
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 truncate w-40">{card.name}</p>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
