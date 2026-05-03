"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useDeckStorage, type RawDeckCard, type SavedDeckMeta } from "@/lib/useDeckStorage";
import { DECK_LIMITS } from "../useDeckRules";
import { WipBadge } from "./WipBadge";
import { TrashIcon } from "lucide-react";

interface SaveDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawCards: RawDeckCard[];
  oshiCardId?: number;
  oshiImageUrl?: string;
  loadedDeckId?: string;
  loadedDeckName?: string;
}

export function SaveDeckModal({ isOpen, onClose, rawCards, oshiCardId, oshiImageUrl, loadedDeckId, loadedDeckName }: SaveDeckModalProps) {
  const [name, setName] = useState(loadedDeckName ?? "My Deck");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingDecks, setExistingDecks] = useState<SavedDeckMeta[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [overwriteTarget, setOverwriteTarget] = useState<SavedDeckMeta | null>(null);

  const { saveDeck, listDecks, deleteDeck, isAuthenticated } = useDeckStorage();

  const totalCards = rawCards.reduce((s, c) => s + c.quantity, 0);
  const isWip = totalCards !== DECK_LIMITS.total;

  useEffect(() => {
    if (isOpen) setName(loadedDeckName ?? "My Deck");
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    setLoadingDecks(true);
    listDecks()
      .then(setExistingDecks)
      .catch(() => {})
      .finally(() => setLoadingDecks(false));
  }, [isOpen, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(deckId?: string, nameOverride?: string) {
    const nameToSave = nameOverride ?? name.trim();
    if (!nameToSave) return;
    setSaving(true);
    setError(null);
    try {
      const id = await saveDeck(nameToSave, rawCards, isWip, deckId, oshiCardId, oshiImageUrl);
      setSavedId(id);
      setTimeout(() => {
        setSavedId(null);
        handleClose();
      }, 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save deck");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteDeck(id);
      setExistingDecks((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("Failed to delete deck");
    } finally {
      setDeletingId(null);
    }
  }

  function handleClose() {
    setName("My Deck");
    setError(null);
    setSavedId(null);
    onClose();
  }

  return (
    <Modal title="Save deck" isOpen={isOpen} onClose={handleClose}>
      {!isAuthenticated ? (
        <p className="text-sm opacity-75">Sign in to save decks.</p>
      ) : savedId ? (
        <p className="text-sm text-green-500">Deck saved!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* WIP warning */}
          {isWip && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 ring-1 ring-inset ring-amber-500/30 px-3 py-2.5 text-sm text-amber-600 dark:text-amber-400">
              <span>This deck has {totalCards}/{DECK_LIMITS.total} cards and will be saved as a work in progress.</span>
            </div>
          )}

          {/* Save as new */}
          <div className="flex flex-col gap-2">
            <Input
              label="Deck name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <Button onClick={() => handleSave()} disabled={saving || !name.trim()}>
              {saving ? "Saving…" : "Save as new"}
            </Button>
          </div>

          {/* Overwrite existing */}
          {!loadingDecks && existingDecks.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs opacity-50 font-medium uppercase tracking-wide">Overwrite existing</p>
              {existingDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 ring-1 ring-inset ring-black/10 dark:ring-white/10"
                >
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{deck.name}</span>
                      {deck.isWip && <WipBadge />}
                    </div>
                    <span className="text-xs opacity-50">
                      {deck.cardCount} cards · {deck.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="transparent"
                      highContrast
                      onClick={() => setOverwriteTarget(deck)}
                      disabled={saving}
                    >
                      Overwrite
                    </Button>
                    <button
                      onClick={() => handleDelete(deck.id)}
                      disabled={deletingId === deck.id}
                      className="h-8 w-8 flex items-center justify-center rounded-lg opacity-40 hover:opacity-100 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}

      <Modal
        title="Overwrite deck?"
        isOpen={!!overwriteTarget}
        onClose={() => setOverwriteTarget(null)}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">
            This will overwrite{" "}
            <span className="font-medium opacity-100">&ldquo;{overwriteTarget?.name}&rdquo;</span>
            {name.trim() && name.trim() !== overwriteTarget?.name ? (
              <> and rename it to <span className="font-medium opacity-100">&ldquo;{name.trim()}&rdquo;</span></>
            ) : null}
            . This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="transparent"
              highContrast
              className="flex-1"
              onClick={() => setOverwriteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={saving}
              onClick={() => {
                if (overwriteTarget) handleSave(overwriteTarget.id);
                setOverwriteTarget(null);
              }}
            >
              Overwrite
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
