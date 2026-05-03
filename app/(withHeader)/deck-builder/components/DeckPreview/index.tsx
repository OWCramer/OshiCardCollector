"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { type Tab, Tabs } from "@/components/Tabs";
import { type FullCardEntry } from "../CardLibrary";
import { buildCheerEntries, useDeckRules } from "../useDeckRules";
import { type RawDeckCard } from "@/lib/useDeckStorage";
import { DeckHeader } from "./DeckHeader";
import { DeckStatsPanel } from "./DeckStatsPanel";
import { HolomemTab } from "./HolomemTab";
import { CheerTab } from "./CheerTab";
import { SupportTab } from "./SupportTab";
import { type DeckEntry, type DeckTab } from "./types";

interface DeckPreviewProps {
  deck: DeckEntry[];
  onRemoveCard: (cardId: number) => void;
  onClearDeck: () => void;
  onCardHover?: (card: FullCardEntry | null) => void;
  allCards: FullCardEntry[];
  onSetCheer: (entries: DeckEntry[]) => void;
  onLoadDeck: (rawCards: RawDeckCard[], deckId: string, deckName: string) => void;
  loadedDeckId?: string;
  loadedDeckName?: string;
}

export function DeckPreview({
  deck,
  onRemoveCard,
  onClearDeck,
  onCardHover,
  allCards,
  onSetCheer,
  onLoadDeck,
  loadedDeckId,
  loadedDeckName,
}: DeckPreviewProps) {
  const cheerOptions = useMemo(() => allCards.filter((c) => c.cardType === "CHEER"), [allCards]);
  const [tab, setTab] = useState<DeckTab>("holomem");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { stats } = useDeckRules(deck);

  const holomemEntries = useMemo(() => deck.filter((e) => e.card.cardType === "HOLOMEM"), [deck]);
  const cheerEntries = useMemo(() => deck.filter((e) => e.card.cardType === "CHEER"), [deck]);
  const supportEntries = useMemo(() => deck.filter((e) => e.card.cardType === "SUPPORT"), [deck]);

  function tabLabel(base: string, entries: DeckEntry[]): string {
    const total = entries.reduce((s, e) => s + e.quantity, 0);
    return total > 0 ? `${base} · ${total}` : base;
  }

  const deckTabs: Tab<DeckTab>[] = [
    { value: "holomem", label: tabLabel("Holomem", holomemEntries) },
    { value: "cheer", label: tabLabel("Cheer", cheerEntries) },
    { value: "support", label: tabLabel("Support", supportEntries) },
  ];

  function handleAutofillCheer() {
    onSetCheer(buildCheerEntries(deck, cheerOptions));
  }

  return (
    <Card className="flex flex-col gap-3 w-full h-full">
      <DeckHeader
        totalCards={stats.total}
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

      <Tabs value={tab} onValueChange={setTab} tabs={deckTabs} fullWidth className="shrink-0" />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 -mx-2">
        {tab === "holomem" && (
          <HolomemTab
            entries={holomemEntries}
            onRemoveCard={onRemoveCard}
            onCardHover={onCardHover}
          />
        )}
        {tab === "cheer" && (
          <CheerTab entries={cheerEntries} onRemoveCard={onRemoveCard} onCardHover={onCardHover} />
        )}
        {tab === "support" && (
          <SupportTab
            entries={supportEntries}
            onRemoveCard={onRemoveCard}
            onCardHover={onCardHover}
          />
        )}
      </div>

      <DeckStatsPanel
        stats={stats}
        rawCards={deck.map((e) => ({ cardId: e.card.id, quantity: e.quantity }))}
        onRemoveOshi={() => stats.oshiEntry && onRemoveCard(stats.oshiEntry.card.id)}
        onCardHover={onCardHover}
        canAutofillCheer={cheerOptions.length > 0}
        onAutofillCheer={handleAutofillCheer}
        onLoadDeck={onLoadDeck}
        loadedDeckId={loadedDeckId}
        loadedDeckName={loadedDeckName}
      />
    </Card>
  );
}

export { type DeckEntry } from "./types";
