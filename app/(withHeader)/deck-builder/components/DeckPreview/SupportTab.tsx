import { useMemo } from "react";
import { Accordion } from "@/components/Accordion";
import { CardGrid, EmptyTabState } from "./CardGrid";
import { type TabProps } from "./types";

export function SupportTab({ entries, onRemoveCard, onCardHover }: TabProps) {
  const groups = useMemo(() => {
    const map: Record<string, typeof entries> = {};
    for (const entry of entries) {
      const type = entry.card.supportType ?? "Unknown";
      (map[type] ??= []).push(entry);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [entries]);

  if (entries.length === 0) return <EmptyTabState text="No support cards in deck" />;

  return (
    <div className="flex flex-col gap-1">
      {groups.map(([type, groupEntries]) => {
        const count = groupEntries.reduce((s, e) => s + e.quantity, 0);
        return (
          <Accordion key={type} variant="slim" title={`${type} · ${count}`} defaultOpen>
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
