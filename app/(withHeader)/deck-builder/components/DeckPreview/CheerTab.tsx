import { CardGrid, EmptyTabState } from "./CardGrid";
import { type TabProps } from "./types";

export function CheerTab({ entries, onRemoveCard, onCardHover }: TabProps) {
  if (entries.length === 0) return <EmptyTabState text="No cheer cards in deck" />;
  return <CardGrid entries={entries} onRemoveCard={onRemoveCard} onCardHover={onCardHover} />;
}
