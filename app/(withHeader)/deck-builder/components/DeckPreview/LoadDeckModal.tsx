"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { type RawDeckCard, type SavedDeckMeta, useDeckStorage } from "@/lib/useDeckStorage";
import { TrashIcon } from "lucide-react";
import { WipBadge } from "./WipBadge";

interface LoadDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasDeckCards: boolean;
  onLoad: (rawCards: RawDeckCard[], deckId: string, deckName: string) => void;
}

export function LoadDeckModal({ isOpen, onClose, hasDeckCards, onLoad }: LoadDeckModalProps) {
  const [decks, setDecks] = useState<SavedDeckMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { listDecks, loadDeck, deleteDeck, isAuthenticated } = useDeckStorage();

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    listDecks()
      .then(setDecks)
      .catch(() => setError("Failed to load saved decks"))
      .finally(() => setLoading(false));
  }, [isOpen, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLoad(id: string) {
    setLoadingId(id);
    setError(null);
    try {
      const { cards, name } = await loadDeck(id);
      onLoad(cards, id, name);
      onClose();
    } catch {
      setError("Failed to load deck");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteDeck(id);
      setDecks((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("Failed to delete deck");
    } finally {
      setDeletingId(null);
    }
  }

  function renderContent() {
    if (!isAuthenticated) return <p className="text-sm opacity-75">Sign in to load saved decks.</p>;
    if (loading) return <p className="text-sm opacity-50">Loading saved decks…</p>;
    if (error) return <p className="text-sm text-red-500">{error}</p>;
    if (decks.length === 0) return <p className="text-sm opacity-50">No saved decks yet.</p>;

    return (
      <div className="flex flex-col gap-2">
        {hasDeckCards && (
          <p className="text-sm opacity-60 mb-1">Loading a deck will replace your current deck.</p>
        )}
        {decks.map((deck) => (
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
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="transparent"
                highContrast
                onClick={() => handleLoad(deck.id)}
                disabled={loadingId === deck.id}
              >
                {loadingId === deck.id ? "Loading…" : "Load"}
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
    );
  }

  return (
    <Modal title="Load deck" isOpen={isOpen} onClose={onClose}>
      {renderContent()}
    </Modal>
  );
}
