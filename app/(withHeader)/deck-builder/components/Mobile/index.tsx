"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { CardPreview } from "../CardPreview";
import { type FullCardEntry } from "../CardLibrary";
import { type DeckEntry } from "../DeckPreview/types";
import { type RawDeckCard } from "@/lib/useDeckStorage";
import { useDeckRules } from "../useDeckRules";
import { MobileDeckPreview } from "./MobileDeckPreview";
import { MobileCardLibrary } from "./MobileCardLibrary";

interface MobileDeckBuilderProps {
  deck: DeckEntry[];
  allCards: FullCardEntry[];
  onRemoveCard: (cardId: number) => void;
  onClearDeck: () => void;
  onSetCheer: (entries: DeckEntry[]) => void;
  onLoadDeck: (rawCards: RawDeckCard[], deckId: string, deckName: string) => void;
  onCardsLoaded: (cards: FullCardEntry[]) => void;
  addCard: (card: FullCardEntry) => void;
  loadedDeckId?: string;
  loadedDeckName?: string;
}

export function MobileDeckBuilder({
  deck,
  allCards,
  onRemoveCard,
  onClearDeck,
  onSetCheer,
  onLoadDeck,
  onCardsLoaded,
  addCard,
  loadedDeckId,
  loadedDeckName,
}: MobileDeckBuilderProps) {
  const [previewCard, setPreviewCard] = useState<FullCardEntry | null>(null);
  const [previewFromDeck, setPreviewFromDeck] = useState(false);
  const { isAtLimit } = useDeckRules(deck);

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      <MobileDeckPreview
        deck={deck}
        allCards={allCards}
        onRemoveCard={onRemoveCard}
        onClearDeck={onClearDeck}
        onSetCheer={onSetCheer}
        onLoadDeck={onLoadDeck}
        onCardPreview={(card) => {
          setPreviewCard(card);
          setPreviewFromDeck(true);
        }}
        loadedDeckId={loadedDeckId}
        loadedDeckName={loadedDeckName}
      />

      {/* flex-1 min-h-0 ensures the library Card can grow to fill remaining space */}
      <div className="flex-1 min-h-0 flex flex-col">
        <MobileCardLibrary
          deck={deck}
          onCardClick={addCard}
          onCardPreview={(card) => {
            setPreviewCard(card);
            setPreviewFromDeck(false);
          }}
          onCardsLoaded={onCardsLoaded}
        />
      </div>

      <Modal
        title={previewCard?.name ?? "Card Preview"}
        isOpen={!!previewCard}
        onClose={() => setPreviewCard(null)}
      >
        {previewCard && (
          <div className="flex flex-col gap-3">
            <CardPreview card={previewCard} />
            {!previewFromDeck && !isAtLimit(previewCard) && (
              <button
                onClick={() => {
                  addCard(previewCard);
                  setPreviewCard(null);
                }}
                className="w-full h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium"
              >
                Add to deck
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
