"use client";

import { useMemo, useState } from "react";
import { FolderOpenIcon, SaveIcon, SparklesIcon } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { classes } from "@/lib/classes";
import { type FullCardEntry } from "../CardLibrary";
import { type DeckEntry } from "../DeckPreview/types";
import { type RawDeckCard } from "@/lib/useDeckStorage";
import { calculateCheerDistribution, useDeckRules, DECK_LIMITS } from "../useDeckRules";
import { MobileDeckGrid } from "./MobileDeckGrid";
import { SaveDeckModal } from "../DeckPreview/SaveDeckModal";
import { LoadDeckModal } from "../DeckPreview/LoadDeckModal";

interface MobileDeckPreviewProps {
  deck: DeckEntry[];
  allCards: FullCardEntry[];
  onRemoveCard: (cardId: number) => void;
  onClearDeck: () => void;
  onSetCheer: (entries: DeckEntry[]) => void;
  onLoadDeck: (rawCards: RawDeckCard[], deckId: string, deckName: string) => void;
  onCardPreview?: (card: FullCardEntry) => void;
  loadedDeckId?: string;
  loadedDeckName?: string;
}

function StatChip({ label, value, max }: { label: string; value: number; max: number }) {
  const over = value > max;
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="opacity-40">{label}</span>
      <span className={classes("font-semibold tabular-nums", over && "text-red-500")}>{value}</span>
      <span className="opacity-25 text-xs">/{max}</span>
    </div>
  );
}

function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-black/8 dark:hover:bg-white/8 active:scale-95 transition-all"
    >
      {children}
    </button>
  );
}

export function MobileDeckPreview({
  deck,
  allCards,
  onRemoveCard,
  onClearDeck,
  onSetCheer,
  onLoadDeck,
  onCardPreview,
  loadedDeckId,
  loadedDeckName,
}: MobileDeckPreviewProps) {
  const cheerOptions = useMemo(() => allCards.filter((c) => c.cardType === "CHEER"), [allCards]);
  const { stats } = useDeckRules(deck);
  const oshiCard = stats.oshiEntry?.card ?? null;
  const rawCards = deck.map((e) => ({ cardId: e.card.id, quantity: e.quantity }));

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAutofillConfirm, setShowAutofillConfirm] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);

  function handleAutofillCheer() {
    const distribution = calculateCheerDistribution(deck);
    const entries: DeckEntry[] = [];
    for (const [color, qty] of Object.entries(distribution)) {
      if (qty <= 0) continue;
      const card = cheerOptions.find((c) => c.colors.includes(color));
      if (card) entries.push({ card, quantity: qty });
    }
    onSetCheer(entries);
  }

  function handleLoadClick() {
    if (rawCards.length > 0) {
      setShowLoadConfirm(true);
    } else {
      setShowLoad(true);
    }
  }

  return (
    <Card className="flex flex-col gap-2 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-sm">
          Deck
          <span className="ml-2 opacity-50 font-normal">
            {stats.total}/{DECK_LIMITS.total}
          </span>
        </h2>
        {deck.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-xs opacity-40 hover:opacity-100 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Horizontal card grid */}
      <MobileDeckGrid
        deck={deck}
        onRemoveCard={onRemoveCard}
        onCardPreview={onCardPreview}
      />

      {/* Compact stats + action bar */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        {/* Stat chips */}
        <div className="flex items-center gap-5 flex-wrap">
          <StatChip label="Oshi" value={oshiCard ? 1 : 0} max={DECK_LIMITS.oshi} />
          <StatChip label="Main" value={stats.main} max={DECK_LIMITS.main} />
          <StatChip label="Cheer" value={stats.cheer} max={DECK_LIMITS.cheer} />
        </div>

        {/* Action icon buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          {cheerOptions.length > 0 && (
            <IconBtn onClick={() => setShowAutofillConfirm(true)} title="Auto-pick cheers">
              <SparklesIcon size={15} className="opacity-70" />
            </IconBtn>
          )}
          <IconBtn onClick={() => setShowSave(true)} title="Save deck">
            <SaveIcon size={15} className="opacity-70" />
          </IconBtn>
          <IconBtn onClick={handleLoadClick} title="Load deck">
            <FolderOpenIcon size={15} className="opacity-70" />
          </IconBtn>
        </div>
      </div>

      {/* Clear confirm */}
      <Modal title="Clear deck?" isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">
            This will remove all {stats.total} cards from your deck.
          </p>
          <div className="flex gap-2">
            <Button variant="transparent" highContrast className="flex-1" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => { onClearDeck(); setShowClearConfirm(false); }}>
              Clear deck
            </Button>
          </div>
        </div>
      </Modal>

      {/* Auto-pick cheers confirm */}
      <Modal title="Auto-pick cheers?" isOpen={showAutofillConfirm} onClose={() => setShowAutofillConfirm(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">
            Auto-pick makes its best guess based on your cards&apos; art costs, but may not always
            choose the right cheers. Review your cheer cards afterward.
          </p>
          <p className="text-sm opacity-75">Any cheer cards already in your deck will be replaced.</p>
          <div className="flex gap-2">
            <Button variant="transparent" highContrast className="flex-1" onClick={() => setShowAutofillConfirm(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => { handleAutofillCheer(); setShowAutofillConfirm(false); }}>
              Auto-pick
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unsaved changes confirm */}
      <Modal title="Unsaved changes" isOpen={showLoadConfirm} onClose={() => setShowLoadConfirm(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">
            Loading a deck will replace your current unsaved deck. Any changes will be lost.
          </p>
          <div className="flex gap-2">
            <Button variant="transparent" highContrast className="flex-1" onClick={() => setShowLoadConfirm(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => { setShowLoadConfirm(false); setShowLoad(true); }}>
              Continue
            </Button>
          </div>
        </div>
      </Modal>

      <SaveDeckModal
        isOpen={showSave}
        onClose={() => setShowSave(false)}
        rawCards={rawCards}
        oshiCardId={oshiCard?.id}
        oshiImageUrl={oshiCard?.imageUrl ?? undefined}
        loadedDeckId={loadedDeckId}
        loadedDeckName={loadedDeckName}
      />

      <LoadDeckModal
        isOpen={showLoad}
        onClose={() => setShowLoad(false)}
        hasDeckCards={rawCards.length > 0}
        onLoad={(cards, deckId, deckName) => {
          onLoadDeck(cards, deckId, deckName);
          setShowLoad(false);
        }}
      />
    </Card>
  );
}
