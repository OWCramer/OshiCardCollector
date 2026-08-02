import { Button } from "@/components/Button";
import { classes } from "@/lib/classes";
import type { CardMapEntry } from "@/lib/use-card-map";
import type { Density } from "./types";

/** Rarities that get the gold treatment — the ones worth double-checking. */
const HOT_RARITIES = new Set(["SR", "SEC", "OUR", "OSR", "UR", "HR"]);

export const isHotRarity = (rarity: string) => HOT_RARITIES.has(rarity);

/**
 * The rarity picker — the question itself when a row is queued, and a "change
 * rarity" control once it's answered.
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
      {printings.map((printing, i) => (
        <Button
          key={printing.id}
          variant={printing.id === selectedId ? "primary" : "secondary"}
          highContrast
          aria-keyshortcuts={showHints ? String(i + 1) : undefined}
          aria-label={showHints ? `${printing.rarity}, press ${i + 1}` : printing.rarity}
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => onHoverPrinting?.(printing.id)}
          onClick={() => onPick(printing.id)}
          className={classes(
            "gap-1.5 font-mono font-semibold",
            density === "touch" ? "h-11 px-3.5 text-[15px]" : "h-7 px-3 text-xs"
          )}
        >
          {printing.rarity}
          {showHints && (
            // Hidden on touch for the same reason as the ↵ badge — no keyboard
            // to press the number on.
            <span aria-hidden className="font-mono text-[10px] opacity-75 pointer-coarse:hidden">
              {i + 1}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
