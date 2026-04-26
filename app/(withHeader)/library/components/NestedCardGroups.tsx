import pluralize from "pluralize";
import { Accordion } from "@/components/Accordion";
import { CardGrid } from "./CardGrid";
import { buildFlatGroups } from "./utils";
import type { Breakdown, CardEntry } from "./types";

interface GroupedCardsProps {
  entries: CardEntry[];
  breakdowns: Breakdown[];
}

export function GroupedCards({ entries, breakdowns }: GroupedCardsProps) {
  const topGroups = buildFlatGroups(entries, [breakdowns[0]]);
  const subBreakdowns = breakdowns.slice(1);

  return (
    <div className="flex flex-col gap-3">
      {topGroups.map((group) => (
        <Accordion
          key={group.key}
          defaultOpen
          title={<GroupTitle label={group.label} count={group.entries.length} />}
        >
          {subBreakdowns.length > 0 ? (
            <SubGroups entries={group.entries} breakdowns={subBreakdowns} />
          ) : (
            <CardGrid entries={group.entries} />
          )}
        </Accordion>
      ))}
    </div>
  );
}

function SubGroups({ entries, breakdowns }: { entries: CardEntry[]; breakdowns: Breakdown[] }) {
  const groups = buildFlatGroups(entries, breakdowns);
  return (
    <div className="flex flex-col gap-1">
      {groups.map((group) => (
        <Accordion
          key={group.key}
          defaultOpen
          variant="slim"
          title={<GroupTitle label={group.label} count={group.entries.length} />}
        >
          <CardGrid entries={group.entries} />
        </Accordion>
      ))}
    </div>
  );
}

function GroupTitle({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex items-center gap-2">
      {label}
      <span className="text-xs opacity-50 font-normal">
        {count} {pluralize("card", count)}
      </span>
    </span>
  );
}
