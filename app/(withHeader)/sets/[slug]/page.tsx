"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetAllCardsQuery } from "@/generated/graphql";
import { Button } from "@/components/Button";
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
    <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
      <Button
        variant="transparent"
        highContrast
        icon={ArrowLeftIcon}
        onClick={() => router.back()}
        className="mb-4"
      >
        Sets
      </Button>

      <h1 className="text-xl font-semibold mb-1">{setName}</h1>
      <p className="text-sm text-zinc-500 mb-6">
        {loading ? "Loading…" : `${cards.length} card${cards.length !== 1 ? "s" : ""}`}
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {cards.map((card) => (
            <Link key={card.id} href={`/card/${card.id}`} className="w-32 shrink-0">
              <div className="rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {card.imageUrl ? (
                  <Image src={card.imageUrl} alt={card.name} width={128} height={179} className="object-cover" />
                ) : (
                  <div className="w-32 h-[179px]" />
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 truncate">{card.name}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
