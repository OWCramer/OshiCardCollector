"use client";

import { useMemo, useState } from "react";
import { CheckIcon, FolderOpenIcon, Rows2Icon, SaveIcon, SparklesIcon, Trash2Icon, XIcon } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { classes } from "@/lib/classes";
import { type FullCardEntry } from "../CardLibrary";
import { type DeckEntry } from "../DeckPreview/types";
import { type RawDeckCard } from "@/lib/useDeckStorage";
import { calculateCheerDistribution, DECK_LIMITS, useDeckRules } from "../useDeckRules";
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

function StatItem({
  label,
  value,
  max,
  hasOshi,
}: {
  label: string;
  value?: number;
  max?: number;
  hasOshi?: boolean;
}) {
  if (hasOshi !== undefined) {
    return (
      <span className="flex items-center gap-1 shrink-0 whitespace-nowrap text-xs">
        <span className="opacity-40">{label}</span>
        {hasOshi ? (
          <CheckIcon size={11} className="text-green-500" />
        ) : (
          <XIcon size={11} className="opacity-30" />
        )}
      </span>
    );
  }
  const over = (value ?? 0) > (max ?? 0);
  return (
    <span
      className={classes(
        "flex items-center gap-1 shrink-0 whitespace-nowrap text-xs",
        over ? "text-red-500" : ""
      )}
    >
      <span className="opacity-40">{label}</span>
      <span className="font-semibold tabular-nums">
        {value}
        <span className="opacity-30 font-normal">/{max}</span>
      </span>
    </span>
  );
}

function Dot() {
  return <span className="opacity-20 text-xs shrink-0 select-none">·</span>;
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

  const [gridRows, setGridRows] = useState<1 | 2>(1);
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
    <Card className="flex flex-col gap-1.5 shrink-0 p-2 pb-0.5">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-sm">
          Deck
          <span className="ml-2 opacity-50 font-normal">
            {stats.total}/{DECK_LIMITS.total}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridRows((r) => (r === 2 ? 1 : 2))}
            title={gridRows === 2 ? "Switch to 1 row" : "Switch to 2 rows"}
            className={classes(
              "flex items-center justify-center h-6 w-6 rounded-md transition-all",
              gridRows === 1
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                : "opacity-40 hover:opacity-70"
            )}
          >
            <Rows2Icon size={13} />
          </button>
          {deck.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              title="Clear deck"
              className="flex items-center justify-center h-6 w-6 rounded-md opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
            >
              <Trash2Icon size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal card grid */}
      <MobileDeckGrid deck={deck} rows={gridRows} onRemoveCard={onRemoveCard} onCardPreview={onCardPreview} />

      {/* Compact stats + action bar */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        {/* Stat row */}
        <div className="flex items-center gap-2 shrink-0">
          <StatItem label="Oshi" hasOshi={!!oshiCard} />
          <Dot />
          <StatItem label="Main" value={stats.main} max={DECK_LIMITS.main} />
          <Dot />
          <StatItem label="Cheer" value={stats.cheer} max={DECK_LIMITS.cheer} />
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
      <Modal
        title="Clear deck?"
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">
            This will remove all {stats.total} cards from your deck.
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

      {/* Auto-pick cheers confirm */}
      <Modal
        title="Auto-pick cheers?"
        isOpen={showAutofillConfirm}
        onClose={() => setShowAutofillConfirm(false)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">
            Auto-pick makes its best guess based on your cards&apos; art costs, but may not always
            choose the right cheers. Review your cheer cards afterward.
          </p>
          <p className="text-sm opacity-75">
            Any cheer cards already in your deck will be replaced.
          </p>
          <div className="flex gap-2">
            <Button
              variant="transparent"
              highContrast
              className="flex-1"
              onClick={() => setShowAutofillConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                handleAutofillCheer();
                setShowAutofillConfirm(false);
              }}
            >
              Auto-pick
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unsaved changes confirm */}
      <Modal
        title="Unsaved changes"
        isOpen={showLoadConfirm}
        onClose={() => setShowLoadConfirm(false)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">
            Loading a deck will replace your current unsaved deck. Any changes will be lost.
          </p>
          <div className="flex gap-2">
            <Button
              variant="transparent"
              highContrast
              className="flex-1"
              onClick={() => setShowLoadConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowLoadConfirm(false);
                setShowLoad(true);
              }}
            >
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
