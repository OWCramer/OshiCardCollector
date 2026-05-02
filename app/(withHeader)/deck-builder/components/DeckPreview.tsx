"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { OCG_CARD_SIZES, OCGCard } from "@/components/OCGCard";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { type FullCardEntry } from "./CardLibrary";
import { useVirtualGrid } from "./useVirtualGrid";

export type DeckEntry = { card: FullCardEntry; quantity: number };

const { width: CARD_WIDTH, height: CARD_HEIGHT } = OCG_CARD_SIZES["xs"];
const GAP = 8;

interface DeckPreviewProps {
  deck: DeckEntry[];
  onRemoveCard: (cardId: number) => void;
  onClearDeck: () => void;
  onCardHover?: (card: FullCardEntry | null) => void;
}

export function DeckPreview({ deck, onRemoveCard, onClearDeck, onCardHover }: DeckPreviewProps) {
  const totalCards = deck.reduce((sum, e) => sum + e.quantity, 0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { scrollRef, rows, virtualizer, gridWidth, gridOffset } = useVirtualGrid(deck, {
    itemWidth: CARD_WIDTH,
    itemHeight: CARD_HEIGHT,
    gap: GAP,
  });

  return (
    <Card className="flex flex-col gap-3 w-full h-full">
      <DeckHeader
        totalCards={totalCards}
        hasCards={deck.length > 0}
        onClearClick={() => setShowClearConfirm(true)}
      />

      <Modal
        title="Clear deck?"
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">
            This will remove all {totalCards} cards from your deck.
          </p>
          <div className="flex gap-2">
            <Button
              variant="transparent"
              highContrast
              className="flex-1"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                onClearDeck();
                setShowClearConfirm(false);
              }}
            >
              Clear deck
            </Button>
          </div>
        </div>
      </Modal>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 -mx-2">
        {deck.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm opacity-40">
            Click a card to add it
          </div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualRow) => (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: gridOffset,
                  width: gridWidth,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex gap-2 pb-2"
              >
                {rows[virtualRow.index].map(({ card, quantity }) => (
                  <OCGCard
                    onHover={(isHovered) => onCardHover?.(isHovered ? card : null)}
                    key={card.id}
                    card={card}
                    size="xs"
                    overlayText={`${quantity}x`}
                    onClick={() => onRemoveCard(card.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function DeckHeader({
  totalCards,
  hasCards,
  onClearClick,
}: {
  totalCards: number;
  hasCards: boolean;
  onClearClick: () => void;
}) {
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
