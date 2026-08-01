"use client";

import { useEffect, useRef, useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { classes } from "@/lib/classes";
import type { Density } from "./types";

/**
 * `− [qty] +`. On desktop the quantity is click-to-edit; on touch it's a plain
 * span, since a 44px tap target that opens a numeric keyboard mid-import is
 * more disruptive than useful.
 */
export function QuantityStepper({
  quantity,
  label,
  density,
  fullWidth,
  onAdjust,
  onSet,
  onCommitFocus,
}: {
  quantity: number;
  /** Card name, for the buttons' accessible names. */
  label: string;
  density: Density;
  /** Spans its container with the buttons pushed to the edges. */
  fullWidth?: boolean;
  onAdjust: (delta: number) => void;
  onSet: (quantity: number) => void;
  /** Returns focus to the search field after an inline edit ends. */
  onCommitFocus?: () => void;
}) {
  const editable = density === "compact";
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (draft !== null) inputRef.current?.select();
  }, [draft]);

  const button = density === "touch" ? "size-11 rounded-[11px]" : "size-7 rounded-[9px]";

  function commit() {
    if (draft === null) return;
    const parsed = Number.parseInt(draft, 10);
    setDraft(null);
    onSet(Number.isNaN(parsed) ? quantity : parsed);
    onCommitFocus?.();
  }

  return (
    <div
      className={classes(
        "flex items-center gap-0.5 p-[3px] rounded-xl",
        "bg-black/5 dark:bg-white/5 ring-1 ring-inset ring-black/10 dark:ring-white/10",
        fullWidth ? "w-full justify-between" : "shrink-0"
      )}
    >
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        // Never let a click on the ledger steal focus from the search field.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAdjust(-1)}
        className={classes(
          button,
          "flex items-center justify-center cursor-pointer opacity-75",
          "hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-blue-500"
        )}
      >
        <MinusIcon size={density === "touch" ? 18 : 15} />
      </button>

      {draft !== null ? (
        <input
          ref={inputRef}
          value={draft}
          inputMode="numeric"
          aria-label={`Quantity of ${label}`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          // The search field owns every other keystroke in this page; keep the
          // editor's digits and Enter from reaching it.
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(null);
              onCommitFocus?.();
            }
          }}
          className={classes(
            "h-7 w-10 rounded-lg text-center font-mono text-sm outline-none",
            "bg-blue-400/20"
          )}
        />
      ) : (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          disabled={!editable}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editable && setDraft(String(quantity))}
          className={classes(
            "min-w-10 font-mono font-semibold",
            density === "touch" ? "h-11 text-[15px]" : "h-7 text-sm cursor-text",
            fullWidth && "flex-1"
          )}
        >
          {quantity}
        </button>
      )}

      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAdjust(1)}
        className={classes(
          button,
          "flex items-center justify-center cursor-pointer",
          "bg-black/5 dark:bg-white/8 hover:bg-black/10 dark:hover:bg-white/15",
          "focus-visible:outline-2 focus-visible:outline-blue-500"
        )}
      >
        <PlusIcon size={density === "touch" ? 18 : 15} />
      </button>
    </div>
  );
}
