import { useMemo } from "react";
import { Accordion } from "@/components/Accordion";
import { CardGrid, EmptyTabState } from "./CardGrid";
import { BLOOM_ORDER, type TabProps } from "./types";

export function HolomemTab({ entries, onRemoveCard, onCardHover }: TabProps) {
  const groups = useMemo(() => {
    const map: Record<string, typeof entries> = {};
    for (const entry of entries) {
      const level = entry.card.bloomLevel ?? "Unknown";
      (map[level] ??= []).push(entry);
    }
    return Object.entries(map).sort(([a], [b]) => (BLOOM_ORDER[a] ?? 99) - (BLOOM_ORDER[b] ?? 99));
  }, [entries]);

  if (entries.length === 0) return <EmptyTabState text="No holomem cards in deck" />;

  return (
    <div className="flex flex-col gap-1">
      {groups.map(([level, groupEntries]) => {
        const count = groupEntries.reduce((s, e) => s + e.quantity, 0);
        return (
          <Accordion key={level} variant="slim" title={`${level} · ${count}`} defaultOpen>
            <CardGrid
              entries={groupEntries}
              onRemoveCard={onRemoveCard}
              onCardHover={onCardHover}
            />
          </Accordion>
        );
      })}
    </div>
  );
}
