import type { CardMapEntry } from "@/lib/use-card-map";
import { classes } from "@/lib/classes";
import type { Density } from "./types";

/** Rarities that get the gold treatment — the ones worth double-checking. */
const HOT_RARITIES = new Set(["SR", "SEC", "OUR", "OSR", "UR", "HR"]);

export function rarityPillClasses(rarity: string) {
  return HOT_RARITIES.has(rarity)
    ? "bg-amber-400/15 text-amber-500 dark:text-amber-400 ring-amber-400/30"
    : "bg-black/8 dark:bg-white/8 opacity-75 ring-black/10 dark:ring-white/10";
}

/**
 * The printing picker — the rarity question itself when a row is queued, and a
 * "change printing" control once it's answered.
 */
export function PrintingChips({
  printings,
  selectedId,
  density,
  showHints,
  onPick,
  onHoverPrinting,
}: {
  printings: CardMapEntry[];
  /** The printing currently filed in the session, if any. */
  selectedId?: number;
  density: Density;
  showHints?: boolean;
  onPick: (cardId: number) => void;
  /** Fires with a card id on hover and null on leave, to drive the card stack. */
  onHoverPrinting?: (cardId: number | null) => void;
}) {
  return (
    <div
      onMouseLeave={() => onHoverPrinting?.(null)}
      className={classes(
        "flex items-center gap-2",
        density === "touch"
          ? // One scrolling line rather than wrapping: a row that grows taller
            // as you open it would shove the stepper around under your thumb.
            // min-w-0/flex-1 is what lets it actually scroll instead of
            // overflowing — as a flex child its min-width would otherwise be
            // its content width.
            "min-w-0 flex-1 flex-nowrap overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "min-w-0 flex-wrap"
      )}
    >
      {printings.map((printing, i) => {
        const active = printing.id === selectedId;
        return (
          <button
            key={printing.id}
            type="button"
            aria-keyshortcuts={showHints ? String(i + 1) : undefined}
            aria-label={showHints ? `${printing.rarity}, press ${i + 1}` : printing.rarity}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => onHoverPrinting?.(printing.id)}
            onClick={() => onPick(printing.id)}
            className={classes(
              "flex shrink-0 items-center gap-1.5 cursor-pointer rounded-[11px]",
              "ring-1 ring-inset transition-colors focus-visible:outline-2 focus-visible:outline-blue-500",
              density === "touch" ? "h-11 px-3.5" : "h-7 px-3",
              active
                ? "bg-blue-400/25 ring-blue-400/45"
                : "bg-black/5 dark:bg-white/6 opacity-75 ring-black/10 dark:ring-white/10"
            )}
          >
            <span
              className={classes(
                "shrink-0 font-mono font-semibold",
                density === "touch" ? "text-[15px]" : "text-xs"
              )}
            >
              {printing.rarity}
            </span>
            {showHints && (
              // No opacity of its own: an inactive chip is already at 75%, and
              // stacking another would take the hint down to 41%. Hidden on
              // touch for the same reason as the ↵ badge — no keyboard to
              // press the number on.
              <span aria-hidden className="shrink-0 font-mono text-[10px] pointer-coarse:hidden">
                {i + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
