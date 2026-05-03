interface DeckHeaderProps {
  totalCards: number;
  hasCards: boolean;
  onClearClick: () => void;
}

export function DeckHeader({ totalCards, hasCards, onClearClick }: DeckHeaderProps) {
  return (
    <div className="flex items-center justify-between shrink-0">
      <div className="flex items-baseline gap-2">
        <h2 className="font-semibold">Deck</h2>
        <span className="text-sm opacity-50">{totalCards} cards</span>
      </div>
      {hasCards && (
        <button
          onClick={onClearClick}
          className="text-[15px] opacity-50 hover:opacity-100 cursor-pointer hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
