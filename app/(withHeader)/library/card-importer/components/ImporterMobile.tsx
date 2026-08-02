"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
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

/**
 * Same state as the desktop layout, inverted: Save sits at the top where you're
 * not typing, the ledger fills the middle, and the search bar docks at the
 * bottom so results rise upward under your thumb.
 */
export function ImporterMobile({ ctl, saver }: { ctl: ImporterController; saver: SaveSession }) {
  const discard = useImporterStore((s) => s.discard);
  const flash = useImporterStore((s) => s.flash);
  const [confirming, setConfirming] = useState(false);
  const [discarding, setDiscarding] = useState(false);
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
    // Plain flow, no height cap and no flex column. The previous version pinned
    // the section to 100dvh with a `sticky bottom-0` bar, but a sticky last
    // child *reserves* its own space at the end of the flow — so content could
    // never pass behind it, and on iOS Safari the 100dvh box fought the
    // collapsing toolbar and clipped the tail of the list. This mirrors
    // all-cards: normal document scroll, a `fixed` bar, and bottom padding on
    // the content to clear it.
    <section aria-label="Card importer" className="w-full">
      {/* Sticks directly under the fixed GlobalHeader, so Save and Discard stay
          reachable however far down the ledger you are. Needs its own opaque
          backdrop — rows scroll underneath it — and pt rather than mt, or the
          margin would leave a transparent strip once it's stuck. z-20 keeps it
          under the header (z-40) and the docked search bar (z-30). */}
      <div className="sticky top-[var(--header-height)] z-20 bg-white/80 backdrop-blur-md dark:bg-zinc-950/80">
        <div className="px-3.5 pt-3 pb-3">
          {/* Summary sits with the title. It's free to shrink and wrap, because
            the unanswered-rarity warning makes it long at 390px. */}
          <div className="mb-2.5 flex items-center gap-2">
            <h1 className="shrink-0 text-lg font-semibold">Import</h1>
            <div className="min-w-0 flex-1">
              <SessionSummary
                totalCards={ctl.totalCards}
                uniqueCount={ctl.rows.length}
                unansweredCount={ctl.unansweredCount}
              />
            </div>
            <Dropdown
              className="w-40 shrink-0"
              items={SORT_ITEMS}
              value={ctl.sortMode}
              onValueChange={ctl.setSortMode}
            />
          </div>

          {/* Half and half. Destructive on the left, primary on the right — the
            conventional order, and it puts Save under the right thumb. */}
          <div className="flex gap-2">
            <Button
              className="flex-1 min-w-0"
              variant="destructive"
              disabled={!hasEntries}
              onClick={() => setDiscarding(true)}
            >
              Discard
            </Button>
            {/* Blocked while a rarity is unanswered — there's no card id to write. */}
            <Button
              className="flex-1 min-w-0"
              variant="primary"
              highContrast
              disabled={!hasEntries || blocked}
              onClick={() => setConfirming(true)}
            >
              Save to library
            </Button>
          </div>

          {(saver.savedAt || saver.error) && (
            <div className="mt-2 flex items-center gap-2 text-xs font-medium">
              {saver.savedAt && (
                <span role="status" className="flex items-center gap-1 text-green-500">
                  <CheckIcon size={13} /> saved
                </span>
              )}
              {saver.error && (
                <span role="alert" className="text-red-500">
                  {saver.error}
                </span>
              )}
            </div>
          )}
        </div>
        {/* Inside the sticky block, so it reads as its lower edge rather than
            scrolling away and leaving the panel floating. */}
        <Divider />
      </div>

      {/* Bottom padding clears the fixed bar so the last row can scroll out
          from behind it, plus the iOS home indicator inset. */}
      <ul className="px-1 py-2 pb-[calc(9rem+env(safe-area-inset-bottom))]">
        {hasEntries ? (
          ctl.rows.map((row) => <SessionRow key={row.entry.key} row={row} density="touch" />)
        ) : (
          <li className="px-5 py-12 text-center text-[13px] leading-relaxed opacity-75">
            Search from the bar below.
            <br />
            Cards stack here, newest at the top.
          </li>
        )}
      </ul>

      {/* Same floating translucent card as the all-cards / library filter bars.
          Fixed, so it's out of flow entirely and the ledger scrolls behind it —
          and behind Safari's floating URL bar, which overlays the same corner.
          The safe-area inset keeps it clear of the home indicator; it resolves
          to 0 when there isn't one, so it matches the other pages exactly.
          z-30 sits under the global header (z-40) and modals (z-50). */}
      <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-30 flex flex-col gap-3 rounded-lg bg-white/50 p-4 ring-1 ring-inset ring-black/10 backdrop-blur dark:bg-black/50 dark:ring-white/15">
        <SearchResults ctl={ctl} density="touch" />
        <SearchField ctl={ctl} density="touch" />
      </div>

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
