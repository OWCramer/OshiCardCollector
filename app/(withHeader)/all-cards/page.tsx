"use client";

import { useGetAllCardsQuery, useGetRaritiesQuery, useGetSetsQuery } from "@/generated/graphql";
import { Dropdown } from "@/components/Dropdown";
import { CARD_SIZES, ItemCard } from "@/components/Card";
import { Input } from "@/components/Input";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { Button } from "@/components/Button";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo, useEffect, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { FilterIcon, Loader2Icon } from "lucide-react";

// Card dimensions (must match rendered size)
const GAP = 16; // gap-4 = 1rem = 16px

export default function AllCardsContent() {
  const { data, loading } = useGetAllCardsQuery({ variables: { pageSize: 0 } });
  const isMedium = useBreakpoint("md");
  const isSmall = !useBreakpoint("sm");

  const { width: CARD_WIDTH, height: CARD_HEIGHT } = useMemo(() => {
    if (isSmall) return CARD_SIZES["sm"];

    return CARD_SIZES["lg"];
  }, [isSmall]);

  const { data: raritiesData } = useGetRaritiesQuery();
  const { data: setsData } = useGetSetsQuery();

  const rarities = useMemo(() => {
    if (!raritiesData) return [];
    return raritiesData.rarities.map((rarity) => ({
      value: rarity,
      label: rarity,
    }));
  }, [raritiesData]);

  const sets = useMemo(() => {
    if (!setsData) return [];
    return setsData.sets.map((set) => ({
      value: set,
      label: set,
    }));
  }, [setsData]);

  const [raritiesFilter, setRaritiesFilter] = useState<Array<string>>([]);
  const [setsFilter, setSetsFilter] = useState<Array<string>>([]);

  const allCards = useMemo(() => data?.cards?.nodes ?? [], [data?.cards?.nodes]);

  const { query: searchFilter, setQuery: setSearchFilter, results: filteredCards } = useSearch(
    allCards,
    { keys: ["name", "setNames"], threshold: 0.3 },
  );

  // Measure main container width to compute columns per row
  const mainRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
      setScrollMargin(el.offsetTop);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // How many cards fit per row (minimum 1)
  const columns = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
  }, [CARD_WIDTH, containerWidth]);

  // Chunk cards into rows
  const rows = useMemo(() => {
    const result: (typeof filteredCards)[number][][] = [];
    for (let i = 0; i < filteredCards.length; i += columns) {
      result.push(filteredCards.slice(i, i + columns));
    }
    return result;
  }, [filteredCards, columns]);

  const rowHeight = CARD_HEIGHT + GAP;

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => rowHeight,
    overscan: 3,
    scrollMargin,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full h-full p-8 justify-start">
      <aside className="flex flex-row md:flex-col gap-4 w-full md:max-w-48 xl:max-w-64 sticky bottom-6 h-fit md:top-23.25 bg-white/50 backdrop-blur ring-1 ring-inset ring-black/10 dark:ring-white/15 rounded-lg p-4">
        <Input
          className="w-full"
          placeholder="Search"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />
        {isMedium ? (
          <div className="flex flex-col gap-4 z-50">
            <Dropdown
              multi
              label="Rarity"
              className="w-full"
              value={raritiesFilter}
              onValueChange={setRaritiesFilter}
              items={rarities}
            />
            <Dropdown
              label="Set"
              multi
              className="w-full"
              value={setsFilter}
              onValueChange={setSetsFilter}
              items={sets}
            />
          </div>
        ) : (
          <Button variant="transparent" highContrast icon={FilterIcon} />
        )}
      </aside>
      <main ref={mainRef} className="flex-1 -z-10">
        {loading ? (
          <div className="flex justify-center items-center w-full">
            <Loader2Icon className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Total height spacer so the page scrollbar is correct */}
            <div style={{ height: totalHeight, position: "relative" }}>
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                    }}
                  >
                    <div className="flex flex-row gap-4 justify-center items-center pb-4">
                      {row.map((card) => (
                        <ItemCard size={isSmall ? "sm" : "lg"} key={card.id} card={card} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
