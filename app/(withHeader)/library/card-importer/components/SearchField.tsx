"use client";

import { CornerDownLeftIcon } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import type { Density } from "./types";
import type { ImporterController } from "./useImporterController";

export const RESULTS_ID = "importer-results";
export const HINT_ID = "importer-hint";
export const optionId = (index: number) => `importer-opt-${index}`;

/**
 * Drops focus after committing a card, but only where a virtual keyboard
 * exists — it covers half the screen, so leaving it up hides the ledger row
 * you just added. On a real keyboard focus is the whole point of the flow, so
 * this keys off pointer coarseness rather than layout width: a touch laptop at
 * desktop size should keep its focus, a phone should not.
 */
export function blurAfterCommitOnTouch() {
  if (!window.matchMedia("(pointer: coarse)").matches) return;
  (document.activeElement as HTMLElement | null)?.blur();
}

/** Matches SEARCH_INPUT_PROPS on the library page. */
const SEARCH_INPUT_PROPS = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: false,
} as const;

export function SearchField({ ctl, density }: { ctl: ImporterController; density: Density }) {
  const { query, setQuery, onKeyDown, results } = ctl;

  return (
    <div className="flex items-center gap-2">
      <Input
        className="flex-1"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={
          density === "touch" ? "Name, set code, number…" : "Card name, set code, or number…"
        }
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={RESULTS_ID}
        aria-autocomplete="list"
        aria-describedby={HINT_ID}
        aria-activedescendant={results.length ? optionId(ctl.selectedIndex) : undefined}
        enterKeyHint="done"
        {...SEARCH_INPUT_PROPS}
      />

      {/* The description the input points at. The visible badge is decorative
          and hidden on touch, so the accessible name lives here regardless. */}
      <span id={HINT_ID} className="sr-only">
        Press Enter to add the highlighted card
      </span>

      {density === "touch" ? (
        <Button
          icon={CornerDownLeftIcon}
          variant="secondary"
          aria-label="Add the highlighted card"
          highContrast
          onMouseDown={(e) => e.preventDefault()}
          // Same action as tapping a result, so it dismisses the keyboard too.
          onClick={() => {
            ctl.commitSelected();
            blurAfterCommitOnTouch();
          }}
        />
      ) : (
        <span aria-hidden className="shrink-0 pointer-coarse:hidden">
          <Badge>↵ add</Badge>
        </span>
      )}
    </div>
  );
}
