"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { useImporterStore } from "../importerStore";
import { SaveDialog } from "./SaveDialog";
import { SearchField } from "./SearchField";
import { SearchResults } from "./SearchResults";
import { SessionRow } from "./SessionRow";
import { SessionSummary } from "./SessionSummary";
import { SORT_ITEMS } from "./sortRows";
import type { ImporterController } from "./useImporterController";
import type { SaveSession } from "./useSaveSession";

/**
 * Same state as the desktop layout, inverted: Save sits at the top where you're
 * not typing, the ledger fills the middle, and the search bar docks at the
 * bottom so results rise upward under your thumb.
 */
export function ImporterMobile({ ctl, saver }: { ctl: ImporterController; saver: SaveSession }) {
  const discard = useImporterStore((s) => s.discard);
  const flash = useImporterStore((s) => s.flash);
  const [confirming, setConfirming] = useState(false);
  const hasEntries = ctl.rows.length > 0;
  const blocked = ctl.unansweredCount > 0;

  // Newest lands at the top of the ledger, which the page scroll has to reach.
  useEffect(() => {
    if (flash) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [flash]);

  async function confirmSave() {
    await saver.save();
    setConfirming(false);
  }

  return (
    // min-h rather than h, and no overflow: the page itself scrolls, so the
    // ledger is plain flow content instead of a nested scroll container.
    <section aria-label="Card importer" className="flex min-h-[calc(100dvh-3.8125rem)] flex-col">
      <div className="border-b border-black/8 dark:border-white/8 px-3.5 pb-3 mt-3">
        <div className="mb-2.5 flex items-center gap-2">
          <div className="flex justify-between w-full items-center">
            <h1 className="shrink-0 text-lg font-semibold">Import</h1>
            <Dropdown
              className="w-40 shrink"
              items={SORT_ITEMS}
              value={ctl.sortMode}
              onValueChange={ctl.setSortMode}
            />
          </div>
          {saver.savedAt && (
            <span
              role="status"
              className="ml-auto flex shrink-0 items-center gap-1 text-xs font-medium text-green-500"
            >
              <CheckIcon size={13} /> saved
            </span>
          )}
        </div>

        {/* Blocked while anything is unanswered — there's no card id to write. */}
        <Button
          className="w-full"
          variant="primary"
          highContrast
          disabled={!hasEntries || blocked}
          onClick={() => setConfirming(true)}
        >
          Save to library
        </Button>

        {/* Summary must be free to shrink and wrap — the unanswered warning
            makes it long, and at 390px it would otherwise push Discard off. */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <SessionSummary
              totalCards={ctl.totalCards}
              uniqueCount={ctl.rows.length}
              unansweredCount={ctl.unansweredCount}
            />
            {saver.error && (
              <span role="alert" className="block text-xs font-medium text-red-500">
                {saver.error}
              </span>
            )}
          </div>
          <Button variant="destructive" disabled={!hasEntries} onClick={discard}>
            Discard
          </Button>
        </div>
      </div>

      <ul className="flex-1 px-1 py-2">
        {hasEntries ? (
          ctl.rows.map((row) => (
            <SessionRow
              key={row.entry.key}
              row={row}
              density="touch"
              onCommitFocus={ctl.focusInput}
            />
          ))
        ) : (
          <li className="px-5 py-12 text-center text-[13px] leading-relaxed opacity-75">
            Search from the bar below.
            <br />
            Cards stack here, newest at the top.
          </li>
        )}
      </ul>

      {/* Sticky rather than fixed: it still occupies layout space at the end of
          the flow, so nothing hides behind it and no bottom padding is needed
          to compensate. Pinned to the viewport bottom while the page scrolls,
          and it settles into place once you reach the end. */}
      <div className="sticky bottom-0 z-10 flex flex-col gap-2 bg-transparent px-3 pt-2 pb-2">
        <SearchResults ctl={ctl} density="touch" />
        <SearchField ctl={ctl} density="touch" />
      </div>

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
