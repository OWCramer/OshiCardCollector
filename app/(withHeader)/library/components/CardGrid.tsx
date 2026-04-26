import { OCGCard } from "@/components/OCGCard";
import type { CardEntry } from "./types";

export function CardGrid({ entries }: { entries: CardEntry[] }) {
  return (
    <div className="grid gap-6 sm:gap-4 md:gap-2 w-full max-w-full justify-center grid-cols-[repeat(auto-fill,160px)]">
      {entries.map(({ card, entry }) => (
        <OCGCard
          href={`/card/${card.id}`}
          key={card.id}
          card={card}
          size="sm"
          overlayText={`${entry.quantity}x`}
        />
      ))}
    </div>
  );
}
