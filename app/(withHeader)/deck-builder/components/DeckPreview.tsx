"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/Card";
import { OCGCard, OCG_CARD_SIZES } from "@/components/OCGCard";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { type FullCardEntry } from "./CardLibrary";

export type DeckEntry = { card: FullCardEntry; quantity: number };

const GAP = 8;
const { width: CARD_WIDTH, height: CARD_HEIGHT } = OCG_CARD_SIZES["xs"];
const ROW_HEIGHT = CARD_HEIGHT + GAP;

interface DeckPreviewProps {
  deck: DeckEntry[];
  onRemoveCard: (cardId: number) => void;
  onClearDeck: () => void;
}

export function DeckPreview({ deck, onRemoveCard, onClearDeck }: DeckPreviewProps) {
  const totalCards = deck.reduce((sum, e) => sum + e.quantity, 0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columns = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
  }, [containerWidth]);

  const gridWidth = columns * CARD_WIDTH + (columns - 1) * GAP;
  const gridOffset = Math.max(0, (containerWidth - gridWidth) / 2);

  const rows = useMemo(() => {
    const result: DeckEntry[][] = [];
    for (let i = 0; i < deck.length; i += columns) {
      result.push(deck.slice(i, i + columns));
    }
    return result;
  }, [deck, columns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
    getScrollElement: () => scrollRef.current,
  });

  return (
    <Card className="flex flex-col gap-3 w-full h-full">
      <div className="flex items-baseline justify-between shrink-0">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold">Deck</h2>
          <span className="text-sm opacity-50">{totalCards} cards</span>
        </div>
        {deck.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-xs opacity-50 hover:opacity-100 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Modal title="Clear deck?" isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">This will remove all {totalCards} cards from your deck.</p>
          <div className="flex gap-2">
            <Button variant="transparent" highContrast className="flex-1" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => { onClearDeck(); setShowClearConfirm(false); }}
            >
              Clear deck
            </Button>
          </div>
        </div>
      </Modal>

      {deck.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm opacity-40">
          Click a card to add it
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 -mx-2">
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
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
                  {row.map(({ card, quantity }) => (
                    <OCGCard
                      key={card.id}
                      card={card}
                      size="xs"
                      overlayText={`${quantity}x`}
                      onClick={() => onRemoveCard(card.id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
