import { OCGCard } from "@/components/OCGCard";
import { type TabProps } from "./types";

export function CardGrid({ entries, onRemoveCard, onCardHover }: TabProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {entries.map(({ card, quantity }) => (
        <OCGCard
          key={card.id}
          card={card}
          size="xs"
          overlayText={`${quantity}x`}
          onClick={() => onRemoveCard(card.id)}
          onHover={(isHovered) => onCardHover?.(isHovered ? card : null)}
        />
      ))}
    </div>
  );
}

export function EmptyTabState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-sm opacity-40">{text}</div>
  );
}
