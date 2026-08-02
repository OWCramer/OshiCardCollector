"use client";

import pluralize from "pluralize";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Modal } from "@/components/Modal";
import { useFavorites } from "@/lib/favorites-context";
import { useImporterStore } from "../importerStore";

/**
 * Confirms the one irreversible step in the flow. The list picker lives here
 * rather than on the page because choosing a list is part of deciding *how* to
 * save, not something you fiddle with while ripping a pack.
 */
export function SaveDialog({
  isOpen,
  onClose,
  onConfirm,
  totalCards,
  rowCount,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalCards: number;
  rowCount: number;
  saving: boolean;
}) {
  const { lists } = useFavorites();
  const listIds = useImporterStore((s) => s.listIds);
  const setListIds = useImporterStore((s) => s.setListIds);

  // Drop selections for lists deleted since they were picked.
  const selected = listIds.filter((id) => lists.some((l) => l.id === id));

  function toggle(listId: string, checked: boolean) {
    setListIds(checked ? [...selected, listId] : selected.filter((id) => id !== listId));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save to library">
      <div className="flex flex-col gap-5">
        <p className="text-sm opacity-75">
          Add <span className="font-semibold">{totalCards}</span> {pluralize("card", totalCards)}{" "}
          across {rowCount} {pluralize("row", rowCount)} to your library? Quantities are added to
          what you already own.
        </p>

        {lists.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-medium">Also add to a list?</p>
            <p className="-mt-1.5 text-xs opacity-75">
              Lists track which cards you have, not how many.
            </p>
            {lists.map((list) => (
              <Checkbox
                key={list.id}
                label={list.name}
                checked={selected.includes(list.id)}
                onCheckedChange={(checked) => toggle(list.id, checked)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="transparent" highContrast onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={onConfirm}>
            {saving ? "Saving…" : `Save ${totalCards} ${pluralize("card", totalCards)}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
