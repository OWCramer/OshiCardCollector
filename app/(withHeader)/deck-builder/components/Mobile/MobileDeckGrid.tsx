"use client";

import { useMemo } from "react";
import { OCGCard, OCG_CARD_SIZES } from "@/components/OCGCard";
import { type FullCardEntry } from "../CardLibrary";
import { type DeckEntry } from "../DeckPreview/types";
import { useLongPress } from "./useLongPress";

const SCALE = 0.6;
const { width: XS_W, height: XS_H } = OCG_CARD_SIZES.xs;
export const MOBILE_CARD_W = Math.round(XS_W * SCALE);
export const MOBILE_CARD_H = Math.round(XS_H * SCALE);
const GAP = 6;
export function mobileGridH(rows: number) {
  return MOBILE_CARD_H * rows + GAP * (rows - 1);
}

// r=14 → circumference = 2π×14 ≈ 87.96
const RING_C = 87.96;

const TYPE_ORDER: Record<string, number> = { OSHI: 0, HOLOMEM: 1, SUPPORT: 2, CHEER: 3 };
const BLOOM_ORDER: Record<string, number> = { Spot: 0, Debut: 1, "1st": 2, "2nd": 3 };

interface MobileDeckGridProps {
  deck: DeckEntry[];
  rows?: 1 | 2;
  onRemoveCard: (cardId: number) => void;
  onCardPreview?: (card: FullCardEntry) => void;
}

function DeckCard({
  entry,
  onRemove,
  onPreview,
}: {
  entry: DeckEntry;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const { pressing, ...handlers } = useLongPress({ onClick: onRemove, onLongPress: onPreview });

  return (
    // overflow-hidden clips the scaled card so the overlay matches perfectly
    <div className="relative select-none overflow-hidden" style={{ width: MOBILE_CARD_W, height: MOBILE_CARD_H }}>
      <div style={{ width: XS_W, height: XS_H, transform: `scale(${SCALE})`, transformOrigin: "top left", pointerEvents: "none" }}>
        <OCGCard card={entry.card} size="xs" shine={false} tiltFactor={0} scaleFactor={1} glareIntensity={0} />
      </div>
      {/* Full-coverage overlay owns all touch/click interaction */}
      <div className="absolute inset-0" {...handlers} />
      {/* Long-press ring indicator */}
      {pressing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="36" height="36" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeDasharray={RING_C}
              opacity="0.9"
              style={{ animation: "longPressRing 0.5s linear forwards" }}
            />
          </svg>
        </div>
      )}
      {entry.quantity > 1 && (
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold leading-none px-1 py-0.5 rounded pointer-events-none">
          ×{entry.quantity}
        </div>
      )}
    </div>
  );
}

export function MobileDeckGrid({ deck, rows = 2, onRemoveCard, onCardPreview }: MobileDeckGridProps) {
  const gridH = mobileGridH(rows);
  const sorted = useMemo(() => {
    return [...deck].sort((a, b) => {
      const tA = TYPE_ORDER[a.card.cardType] ?? 99;
      const tB = TYPE_ORDER[b.card.cardType] ?? 99;
      if (tA !== tB) return tA - tB;
      const bA = BLOOM_ORDER[a.card.bloomLevel ?? ""] ?? 99;
      const bB = BLOOM_ORDER[b.card.bloomLevel ?? ""] ?? 99;
      return bA - bB;
    });
  }, [deck]);

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm opacity-30 text-center px-4" style={{ height: gridH }}>
        Tap cards in the library below to add them
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <div
        className="grid"
        style={{
          gridTemplateRows: `repeat(${rows}, ${MOBILE_CARD_H}px)`,
          gridAutoFlow: "column",
          gridAutoColumns: MOBILE_CARD_W,
          gap: GAP,
          width: "max-content",
          height: gridH,
        }}
      >
        {sorted.map((entry) => (
          <DeckCard
            key={entry.card.id}
            entry={entry}
            onRemove={() => onRemoveCard(entry.card.id)}
            onPreview={() => onCardPreview?.(entry.card)}
          />
        ))}
      </div>
    </div>
  );
}
