import { useMemo } from "react";
import { useGetAllCardsQuery, type GetAllCardsQuery } from "@/generated/graphql";

export type CardMapEntry = GetAllCardsQuery["cards"]["nodes"][number];

/**
 * Fetches all cards once (shared Apollo cache with the all-cards page) and
 * returns a stable id → card lookup map. Pass `skip: true` until the user is
 * confirmed logged-in so the query doesn't fire unauthenticated.
 *
 * Callers merge the map with their own Firestore entries to preserve metadata
 * (addedAt, quantity, updatedAt, etc.) alongside the card display data.
 */
export function useCardMap(skip = false): { cardMap: Record<number, CardMapEntry>; loading: boolean } {
  const { data, loading } = useGetAllCardsQuery({
    variables: { pageSize: 0 },
    skip,
  });

  const cardMap = useMemo(() => {
    const map: Record<number, CardMapEntry> = {};
    for (const card of data?.cards?.nodes ?? []) {
      map[card.id] = card;
    }
    return map;
  }, [data]);

  return { cardMap, loading };
}
