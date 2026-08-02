"use client";

import { CornerDownLeftIcon, SearchIcon } from "lucide-react";
import { classes } from "@/lib/classes";
import type { Density } from "./types";
import type { ImporterController } from "./useImporterController";

export const RESULTS_ID = "importer-results";
export const HINT_ID = "importer-hint";
export const optionId = (index: number) => `importer-opt-${index}`;

export function SearchField({ ctl, density }: { ctl: ImporterController; density: Density }) {
  const { query, setQuery, onKeyDown, results } = ctl;
  const expanded = results.length > 0;

  return (
    <div
      className={classes(
        "flex items-center gap-3 rounded-2xl bg-black/5 dark:bg-white/6 backdrop-blur-md",
        "ring-1 ring-inset ring-blue-400/45 shadow-[0_0_0_4px_rgba(96,165,250,0.10)]",
        density === "touch" ? "h-13 pl-4 pr-2" : "h-14 px-[18px]"
      )}
    >
      <SearchIcon size={17} className="shrink-0 text-blue-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={
          density === "touch" ? "Name, set code, number…" : "Card name, set code, or number…"
        }
        role="combobox"
        aria-expanded={expanded}
        aria-controls={RESULTS_ID}
        aria-autocomplete="list"
        aria-describedby={HINT_ID}
        aria-activedescendant={results.length ? optionId(ctl.selectedIndex) : undefined}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        className="h-full flex-1 min-w-0 border-0 bg-transparent text-base outline-none placeholder:opacity-75"
      />
      {density === "touch" ? (
        <>
          {/* The input's aria-describedby points here in both densities. */}
          <span id={HINT_ID} className="sr-only">
            Press Enter to add the highlighted card
          </span>
          <button
            type="button"
            aria-label="Add the highlighted card"
            onMouseDown={(e) => e.preventDefault()}
            onClick={ctl.commitSelected}
            className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-400/25 ring-1 ring-inset ring-blue-400/40 focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <CornerDownLeftIcon size={16} />
          </button>
        </>
      ) : (
        <span
          id={HINT_ID}
          className="shrink-0 rounded-md bg-black/5 dark:bg-white/6 px-2 py-1.5 font-mono text-[11px] leading-none opacity-75"
        >
          ↵ add
        </span>
      )}
    </div>
  );
}
