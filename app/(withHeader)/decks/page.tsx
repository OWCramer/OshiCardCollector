"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { type SavedDeckMeta, useDeckStorage } from "@/lib/useDeckStorage";
import { PageContainer } from "@/components/PageContainer";
import { PageLoading } from "@/components/PageLoading";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/Badge";
import { PencilIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import pluralize from "pluralize";

function DecksContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { listDecks, renameDeck, deleteDeck, isAuthenticated } = useDeckStorage();

  const [decks, setDecks] = useState<SavedDeckMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rename state
  const [renameTarget, setRenameTarget] = useState<SavedDeckMeta | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renaming, setRenaming] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<SavedDeckMeta | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    listDecks()
      .then(setDecks)
      .catch(() => setError("Failed to load decks"))
      .finally(() => setLoading(false));
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  function openRename(deck: SavedDeckMeta) {
    setRenameTarget(deck);
    setRenameName(deck.name);
  }

  async function handleRename() {
    if (!renameTarget || !renameName.trim()) return;
    setRenaming(true);
    try {
      await renameDeck(renameTarget.id, renameName.trim());
      setDecks((prev) =>
        prev.map((d) => (d.id === renameTarget.id ? { ...d, name: renameName.trim() } : d))
      );
      setRenameTarget(null);
    } catch {
      setError("Failed to rename deck");
    } finally {
      setRenaming(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDeck(deleteTarget.id);
      setDecks((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete deck");
    } finally {
      setDeleting(false);
    }
  }

  if (authLoading || loading) return <PageLoading />;
  if (!user) return null;

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Decks</h1>
          <p className="text-sm opacity-50">
            {decks.length} {pluralize("deck", decks.length)}
          </p>
        </div>
        <Button highContrast variant="transparent" onClick={() => router.push("/deck-builder")}>
          New deck
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 opacity-40">
          <p className="text-sm">No saved decks yet.</p>
          <Button variant="transparent" highContrast onClick={() => router.push("/deck-builder")}>
            Build your first deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="flex flex-col rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 ring-1 ring-inset ring-black/10 dark:ring-white/10"
            >
              {/* Oshi card banner */}
              <div className="overflow-hidden">
                <div
                  className="relative w-full aspect-63/88 bg-black/10 dark:bg-white/5 flex items-center justify-center"
                  style={{ marginBottom: "-15px" }}
                >
                  {deck.oshiImageUrl ? (
                    <Image
                      src={deck.oshiImageUrl}
                      alt={deck.name}
                      fill
                      className="object-contain"
                      sizes="400px"
                    />
                  ) : (
                    <span className="text-xs opacity-30">No Oshi</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-black/60 to-transparent" />
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{deck.name}</span>
                      {deck.isWip && <Badge color="amber">WIP</Badge>}
                    </div>
                    <span className="text-xs opacity-50">
                      {deck.cardCount} cards · Updated {deck.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openRename(deck)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg opacity-40 hover:opacity-100 transition-opacity"
                      title="Rename"
                    >
                      <PencilIcon size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(deck)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg opacity-40 hover:opacity-100 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => router.push(`/deck-builder?load=${deck.id}`)}
                  highContrast
                  variant="transparent"
                >
                  Open in Deck Builder
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename modal */}
      <Modal title="Rename deck" isOpen={!!renameTarget} onClose={() => setRenameTarget(null)}>
        <div className="flex flex-col gap-4">
          <Input
            label="Deck name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              variant="transparent"
              highContrast
              className="flex-1"
              onClick={() => setRenameTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={renaming || !renameName.trim()}
              onClick={handleRename}
            >
              {renaming ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal title="Delete deck?" isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-75">
            <span className="font-medium opacity-100">&ldquo;{deleteTarget?.name}&rdquo;</span> will
            be permanently deleted. This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="transparent"
              highContrast
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}

export default function DecksPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DecksContent />
    </Suspense>
  );
}
