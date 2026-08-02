"use client";

import { useEffect, useRef, useState } from "react";
import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { classes } from "@/lib/classes";
import type { Density } from "./types";

/**
 * `− [qty] +`. On desktop the quantity is click-to-edit; on touch it's a plain
 * label, since a 44px tap target that opens a numeric keyboard mid-import is
 * more disruptive than useful.
 */
export function QuantityStepper({
  quantity,
  label,
  density,
  fullWidth,
  onAdjust,
  onSet,
}: {
  quantity: number;
  /** Card name, for the buttons' accessible names. */
  label: string;
  density: Density;
  /** Spans its container with the buttons pushed to the edges. */
  fullWidth?: boolean;
  onAdjust: (delta: number) => void;
  onSet: (quantity: number) => void;
}) {
  const editable = density === "compact";
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (draft !== null) inputRef.current?.select();
  }, [draft]);

  const size = density === "touch" ? "size-11" : "size-7";
  const iconSize = density === "touch" ? 18 : 15;
  /** Stepping down from 1 deletes the row, so the button changes meaning. */
  const removes = quantity <= 1;

  function commit() {
    if (draft === null) return;
    const parsed = Number.parseInt(draft, 10);
    setDraft(null);
    onSet(Number.isNaN(parsed) ? quantity : parsed);
  }

  return (
    <div
      className={classes(
        "flex items-center gap-0.5 p-[3px] rounded-xl",
        "bg-black/5 dark:bg-white/5 ring-1 ring-inset ring-black/10 dark:ring-white/10",
        fullWidth ? "w-full justify-between" : "shrink-0"
      )}
    >
      <Button
        // At 1 this removes the row rather than decrementing it, so it becomes
        // an X and reads as destructive — it's the only remove affordance, so
        // it has to say so itself.
        variant={removes ? "destructive" : "secondary"}
        highContrast={!removes}
        icon={removes ? XIcon : MinusIcon}
        iconSize={iconSize}
        aria-label={removes ? `Remove ${label} from session` : `Decrease quantity of ${label}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAdjust(-1)}
        className={size}
      />

      {draft !== null ? (
        <Input
          ref={inputRef}
          value={draft}
          inputMode="numeric"
          aria-label={`Quantity of ${label}`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          // The search field owns every other keystroke on this page; keep the
          // editor's digits and Enter from reaching it.
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setDraft(null);
          }}
          className="w-14"
          inputClassName={classes(
            "px-0 text-center font-mono font-semibold",
            density === "touch" ? "h-11" : "h-7"
          )}
        />
      ) : (
        <Button
          variant="transparent"
          highContrast
          aria-hidden
          tabIndex={-1}
          disabled={!editable}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editable && setDraft(String(quantity))}
          className={classes(
            "min-w-10 px-0 font-mono font-semibold ring-0",
            density === "touch" ? "h-11 text-[15px]" : "h-7 text-sm cursor-text",
            // Not really disabled on touch — just not editable — so it should
            // not read as dimmed.
            !editable && "opacity-100",
            fullWidth && "flex-1"
          )}
        >
          {quantity}
        </Button>
      )}

      <Button
        variant="secondary"
        highContrast
        icon={PlusIcon}
        iconSize={iconSize}
        aria-label={`Increase quantity of ${label}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAdjust(1)}
        className={size}
      />
    </div>
  );
}
