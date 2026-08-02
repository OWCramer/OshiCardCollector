"use client";

import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { classes } from "@/lib/classes";
import { CardMeta } from "./CardMeta";
import { CardStack } from "./CardStack";
import { MIN_QUERY_LENGTH } from "./searchCards";
import { RESULTS_ID, blurAfterCommitOnTouch, optionId } from "./SearchField";
import type { Density } from "./types";
import type { ImporterController } from "./useImporterController";

/** Rough row height, refined per row by measureElement once mounted. */
const ESTIMATED_ROW = { compact: 210, touch: 170 } as const;

export function SearchResults({ ctl, density }: { ctl: ImporterController; density: Density }) {
  const { results, selectedIndex, query, rows } = ctl;
  const listRef = useRef<HTMLDivElement>(null);

  // Uncapped results mean a broad query can match ~900 groups, each rendering
  // an animated stack of real card components. Only the visible window is
  // mounted; the rest is a spacer.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ESTIMATED_ROW[density],
    overscan: 4,
  });

  // Keyboard selection has to drag the window with it — the selected row may
  // not be mounted at all until the virtualizer scrolls to it.
  useEffect(() => {
    if (results.length) virtualizer.scrollToIndex(selectedIndex, { align: "auto" });
  }, [selectedIndex, results.length, virtualizer]);

  // On touch this renders inside the floating search card, so it drops its own
  // surface — a panel within a panel reads as a mistake.
  const surface =
    density === "touch"
      ? ""
      : "rounded-2xl bg-black/5 dark:bg-white/6 ring-1 ring-inset ring-black/10 dark:ring-white/10 shadow-lg backdrop-blur-lg";

  const tooShort = query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH;

  if (tooShort || (query && !results.length)) {
    return (
      <div className={classes("flex items-center gap-3", surface, density === "compact" && "p-4")}>
        <span className="text-[13.5px]">
          {tooShort ? (
            `Keep typing — ${MIN_QUERY_LENGTH} characters to search`
          ) : (
            <>
              No card matches “<span className="font-mono">{query}</span>”
            </>
          )}
        </span>
        {!tooShort && (
          <span className="ml-auto hidden opacity-75 sm:block">
            Try the set code printed bottom of the card
          </span>
        )}
      </div>
    );
  }

  if (!results.length) return null;

  return (
    <div
      ref={listRef}
      className={classes(
        "overflow-y-auto overscroll-contain",
        surface,
        density === "touch" ? "max-h-[46dvh]" : "max-h-[60dvh]"
      )}
    >
      <ul
        id={RESULTS_ID}
        role="listbox"
        aria-label="Card search results"
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const { group } = results[virtualRow.index];
          const i = virtualRow.index;
          const selected = i === selectedIndex;
          // Counts queued copies too — they're in the session, just unanswered.
          const inSession = rows.reduce(
            (sum, r) => (r.entry.groupKey === group.key ? sum + r.entry.quantity : sum),
            0
          );
          return (
            <li
              key={group.key}
              id={optionId(i)}
              role="option"
              aria-selected={selected}
              // Only a window of options exists in the DOM, so assistive tech
              // needs the real list size and this row's place in it.
              aria-setsize={results.length}
              aria-posinset={i + 1}
              data-index={i}
              ref={virtualizer.measureElement}
              // onMouseMove, not onMouseEnter — a stationary cursor shouldn't
              // hijack the selection when the list re-renders under it.
              onMouseMove={() => ctl.setSelectedIndex(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                ctl.pickGroup(group);
                blurAfterCommitOnTouch();
              }}
              className={classes(
                // Rounded because the panel no longer clips it: on touch the
                // list has no surface of its own, so a square highlight ran
                // flat into the floating card's rounded corners.
                "absolute top-0 left-0 flex w-full cursor-pointer items-center gap-3 rounded-lg border-t border-black/5 dark:border-white/5",
                density === "touch" ? "px-3 py-2.5" : "px-3.5 py-2.5",
                selected && "bg-blue-400/15 shadow-[inset_2px_0_0_var(--color-blue-400)]"
              )}
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <CardStack printings={group.stackPrintings} density={density} index={i} />
              <div className="min-w-0 flex-1">
                {/* Reserve room for the floating session count only when there
                    is one — otherwise the padding truncates names for a badge
                    that isn't rendered, which bites hardest on narrow screens. */}
                <div className={classes("truncate text-sm font-medium", inSession > 0 && "pr-24")}>
                  {group.name}
                </div>
                <CardMeta
                  className="mt-0.5"
                  cardNumber={group.cardNumber}
                  colors={group.colors}
                  cardType={density === "compact" ? group.cardType : undefined}
                  // On touch the set drops to its own line below — inline it had
                  // to share a narrow row with the number and colour icons and
                  // truncated to an initial.
                  setName={density === "compact" ? group.setName : undefined}
                />
                {density === "touch" && group.setName && (
                  <div className="mt-1 truncate text-[11.5px] leading-none opacity-75">
                    {group.setName}
                  </div>
                )}
              </div>
              {/* Absolute so its width never competes with the card name — as a
                  flex sibling it pushed long names into truncation on mobile. */}
              {inSession > 0 && (
                <span className="absolute top-2.5 right-3 text-[11px] whitespace-nowrap opacity-75">
                  +{inSession} this session
                </span>
              )}
              <span
                aria-hidden
                className={classes(
                  "shrink-0 rounded-md bg-blue-400/20 px-1.5 py-1 font-mono text-[11px] leading-none text-blue-500 dark:text-blue-400",
                  // Hidden on touch: there's no Enter key to press there, and
                  // the search bar already has its own commit button.
                  "pointer-coarse:hidden",
                  // visible/invisible rather than an opacity fade: this is
                  // hiding the badge while reserving its space, not muting it.
                  selected ? "visible" : "invisible"
                )}
              >
                ↵
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
