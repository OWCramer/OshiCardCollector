"use client";

import pluralize from "pluralize";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";

/**
 * Discard throws away the whole session, and the draft is the only copy — it
 * was never written to Firestore. Worth a confirmation.
 */
export function DiscardDialog({
  isOpen,
  onClose,
  onConfirm,
  totalCards,
  rowCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalCards: number;
  rowCount: number;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Discard this session?">
      <div className="flex flex-col gap-5">
        <p className="text-sm opacity-75">
          This clears <span className="font-semibold">{totalCards}</span>{" "}
          {pluralize("card", totalCards)} across {rowCount} {pluralize("row", rowCount)}. Nothing
          has been saved to your library yet, so this can&apos;t be undone.
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="transparent" highContrast onClick={onClose}>
            Keep them
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Discard {totalCards} {pluralize("card", totalCards)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
