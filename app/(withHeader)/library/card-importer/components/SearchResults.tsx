"use client";

import { useEffect, useRef } from "react";
import { classes } from "@/lib/classes";
import { CardMeta } from "./CardMeta";
import { CardStack } from "./CardStack";
import { RESULTS_ID, optionId } from "./SearchField";
import type { Density } from "./types";
import type { ImporterController } from "./useImporterController";

export function SearchResults({ ctl, density }: { ctl: ImporterController; density: Density }) {
  const { results, selectedIndex, query, rows } = ctl;
  const listRef = useRef<HTMLUListElement>(null);

  // The panel scrolls now, so arrowing past its edge has to bring the
  // highlighted row back into view or the selection goes invisible.
  useEffect(() => {
    listRef.current?.children[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, results.length]);

  if (query && !results.length) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-black/5 dark:bg-white/6 p-4 ring-1 ring-inset ring-black/10 dark:ring-white/10 backdrop-blur-lg">
        <span className="text-[13.5px]">
          No card matches “<span className="font-mono">{query}</span>”
        </span>
        <span className="ml-auto hidden opacity-75 sm:block">
          Try the set code printed bottom-left of the card
        </span>
      </div>
    );
  }

  if (!results.length) return null;

  return (
    <ul
      ref={listRef}
      id={RESULTS_ID}
      role="listbox"
      aria-label="Card search results"
      // Full-size card art makes five results ~950px tall, so the panel has to
      // scroll — on mobile it would otherwise push the docked search bar off
      // the bottom of the screen.
      className={classes(
        "overflow-y-auto overscroll-contain rounded-2xl shadow-lg backdrop-blur-lg",
        "bg-black/5 dark:bg-white/6 ring-1 ring-inset ring-black/10 dark:ring-white/10",
        density === "touch" ? "max-h-[46dvh]" : "max-h-[60dvh]"
      )}
    >
      {results.map(({ group }, i) => {
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
            // onMouseMove, not onMouseEnter — a stationary cursor shouldn't
            // hijack the selection when the list re-renders under it.
            onMouseMove={() => ctl.setSelectedIndex(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => ctl.pickGroup(group)}
            className={classes(
              "relative flex cursor-pointer items-center gap-3 border-t border-black/5 dark:border-white/5 first:border-t-0",
              density === "touch" ? "px-3 py-2.5" : "px-3.5 py-2.5",
              selected && "bg-blue-400/15 shadow-[inset_2px_0_0_var(--color-blue-400)]"
            )}
          >
            <CardStack printings={group.printings} density={density} index={i} />
            <div className="min-w-0 flex-1">
              {/* Only the name reserves room for the floating session count —
                  it's the one line the badge sits level with. */}
              <div className="truncate pr-20 text-sm font-medium">{group.name}</div>
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
                // Hidden on touch: there's no Enter key to press there, and the
                // search bar already has its own commit button.
                "pointer-coarse:hidden",
                // visible/invisible rather than an opacity fade: this is hiding
                // the badge while reserving its space, not muting it.
                selected ? "visible" : "invisible"
              )}
            >
              ↵
            </span>
          </li>
        );
      })}
    </ul>
  );
}
