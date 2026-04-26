"use client";

import Link from "next/link";
import { useGetSetsQuery } from "@/generated/graphql";
import { PageContainer } from "@/components/PageContainer";
import { PageLoading } from "@/components/PageLoading";

export default function SetsPage() {
  const { data, loading } = useGetSetsQuery();

  if (loading) {
    return <PageLoading />;
  }

  const sets = data?.sets ?? [];

  return (
    <PageContainer>
      <h1 className="text-xl font-semibold mb-1">Sets</h1>
      <p className="text-sm text-zinc-500 mb-6">{sets.length} set{sets.length !== 1 ? "s" : ""}</p>
      <div className="flex flex-col gap-2">
        {sets.map((set) => (
          <Link
            key={set}
            href={`/sets/${encodeURIComponent(set)}`}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-150"
          >
            <span className="font-medium text-sm">{set}</span>
            <span className="text-zinc-400 text-xs">→</span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
