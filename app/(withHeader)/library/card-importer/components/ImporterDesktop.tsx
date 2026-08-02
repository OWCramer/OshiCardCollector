"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { useImporterStore } from "../importerStore";
import { DiscardDialog } from "./DiscardDialog";
import { SaveDialog } from "./SaveDialog";
import { SearchField } from "./SearchField";
import { SearchResults } from "./SearchResults";
import { SessionRow } from "./SessionRow";
import { SessionSummary } from "./SessionSummary";
import { SORT_ITEMS } from "./sortRows";
import type { ImporterController } from "./useImporterController";
import type { SaveSession } from "./useSaveSession";

export function ImporterDesktop({ ctl, saver }: { ctl: ImporterController; saver: SaveSession }) {
  const discard = useImporterStore((s) => s.discard);
  const [confirming, setConfirming] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const hasEntries = ctl.rows.length > 0;
  const blocked = ctl.unansweredCount > 0;

  async function confirmSave() {
    await saver.save();
    setConfirming(false);
  }

  return (
    <section aria-label="Card importer" className="mx-auto w-full max-w-[900px] px-4 py-6">
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold tracking-tight">Import cards</h1>
        <p className="mt-0.5 text-[13px] opacity-75">
          Rip a pack, type as you go. Nothing saves until you hit save.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <SearchField ctl={ctl} density="compact" />
        <SearchResults ctl={ctl} density="compact" />
      </div>

      <div className="mt-6 mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <span className="shrink-0 text-[13px] font-semibold">This session</span>
        <div className="min-w-0 flex-1">
          <SessionSummary
            totalCards={ctl.totalCards}
            uniqueCount={ctl.rows.length}
            unansweredCount={ctl.unansweredCount}
          />
        </div>
        {saver.savedAt && (
          <span
            role="status"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-green-500"
          >
            <CheckIcon size={13} /> saved to your library
          </span>
        )}
        {saver.error && (
          <span role="alert" className="shrink-0 text-xs font-medium text-red-500">
            {saver.error}
          </span>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <Dropdown
            className="w-40"
            items={SORT_ITEMS}
            value={ctl.sortMode}
            onValueChange={ctl.setSortMode}
          />
          <Button variant="destructive" disabled={!hasEntries} onClick={() => setDiscarding(true)}>
            Discard
          </Button>
          {/* Blocked while anything is unanswered — there's no card id to write. */}
          <Button
            variant="primary"
            highContrast
            disabled={!hasEntries || blocked}
            onClick={() => setConfirming(true)}
          >
            Save to library
          </Button>
        </div>
      </div>

      {/* No overflow clip: it isn't needed for scrolling (the page scrolls) and
          it was cutting off the card art's drop shadow on the edge rows. */}
      <ul className="rounded-xl ring-1 ring-inset ring-black/8 dark:ring-white/8">
        {hasEntries ? (
          ctl.rows.map((row) => <SessionRow key={row.entry.key} row={row} density="compact" />)
        ) : (
          <li className="px-5 py-10 text-center text-[13px] opacity-75">
            {/* No opacity on these — they'd nest inside the parent's 75% and
                compound down to 56%. font-mono is enough to set them apart. */}
            Nothing yet. Type <span className="font-mono">hSD01</span> or{" "}
            <span className="font-mono">Tokino</span> and press ↵.
          </li>
        )}
      </ul>

      <DiscardDialog
        isOpen={discarding}
        onClose={() => setDiscarding(false)}
        onConfirm={() => {
          discard();
          setDiscarding(false);
        }}
        totalCards={ctl.totalCards}
        rowCount={ctl.rows.length}
      />

      <SaveDialog
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => void confirmSave()}
        totalCards={ctl.totalCards}
        rowCount={ctl.rows.length}
        saving={saver.saving}
      />
    </section>
  );
}
