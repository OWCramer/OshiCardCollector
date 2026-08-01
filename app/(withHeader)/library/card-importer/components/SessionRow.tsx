"use client";

import { useState } from "react";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { classes } from "@/lib/classes";
import { useImporterStore } from "../importerStore";
import { CardArt } from "./CardArt";
import { CardMeta } from "./CardMeta";
import { CardStack } from "./CardStack";
import { PrintingChips, rarityPillClasses } from "./PrintingChips";
import { QuantityStepper } from "./QuantityStepper";
import type { Density, LedgerRow } from "./types";

export function SessionRow({
  row,
  density,
  onCommitFocus,
}: {
  row: LedgerRow;
  density: Density;
  onCommitFocus: () => void;
}) {
  const { entry, card, group, isActiveQuestion } = row;
  const [expanded, setExpanded] = useState(false);

  const adjustQuantity = useImporterStore((s) => s.adjustQuantity);
  const setQuantity = useImporterStore((s) => s.setQuantity);
  const removeEntry = useImporterStore((s) => s.removeEntry);
  const assignPrinting = useImporterStore((s) => s.assignPrinting);
  const flash = useImporterStore((s) => s.flash);

  const flashNonce = flash?.key === entry.key ? flash.nonce : null;
  const queued = entry.cardId === null;
  const name = group?.name ?? card?.name ?? `Card #${entry.cardId ?? "?"}`;
  const multi = (group?.printings.length ?? 0) > 1;

  // A queued row shows its chips permanently — that IS the question. A resolved
  // one hides them behind the rarity pill until you want to change printing.
  const showChips = group && (queued || expanded);

  const printingBadge = queued ? (
    <span
      className={classes(
        "shrink-0 rounded-full px-1.5 py-[3px] font-mono text-[10px] tracking-wide ring-1 ring-inset",
        "bg-amber-400/20 text-amber-600 dark:text-amber-400 ring-amber-400/35"
      )}
    >
      pick printing
    </span>
  ) : (
    card && (
      <button
        type="button"
        aria-expanded={multi ? expanded : undefined}
        aria-label={multi ? `${card.rarity}, change printing` : card.rarity}
        disabled={!multi}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => multi && setExpanded((v) => !v)}
        className={classes(
          "flex shrink-0 items-center gap-0.5 rounded-full font-mono tracking-wide ring-1 ring-inset",
          rarityPillClasses(card.rarity),
          // On its own line on touch, so it can afford a real tap target.
          density === "touch" ? "h-7 px-2.5 text-[11px]" : "px-1.5 py-[3px] text-[10px]",
          multi
            ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
            : "cursor-default"
        )}
      >
        {card.rarity}
        {multi && <ChevronDownIcon size={density === "touch" ? 12 : 10} aria-hidden />}
      </button>
    )
  );

  return (
    <li
      className={classes(
        "relative border-t border-black/5 dark:border-white/5 first:border-t-0",
        // The list no longer clips, so the end rows round themselves — a queued
        // row's amber tint would otherwise square off the container's corners.
        "first:rounded-t-xl last:rounded-b-xl",
        density === "touch" ? "px-3 py-2.5" : "px-3.5 py-2.5",
        queued && "bg-amber-400/6",
        isActiveQuestion && "shadow-[inset_2px_0_0_var(--color-amber-400)]"
      )}
    >
      {/* Purely decorative, and keyed by the nonce so a repeat add replays the
          animation. Kept out of the content subtree so remounting it can never
          discard an in-progress quantity edit. */}
      {flashNonce !== null && (
        <span
          key={flashNonce}
          aria-hidden
          className="pointer-events-none absolute inset-0 motion-safe:animate-[importerFlash_900ms_ease-out]"
        />
      )}

      {/* On touch the stepper drops to its own full-width row below, because a
          44px stepper beside the info squeezed the name and set to initials. */}
      <div className={classes("relative flex gap-3", density === "touch" ? "items-start" : "items-center")}>
        {/* A queued row hasn't picked a printing, so it cycles through all of
            them — that's the question it's asking. Once answered it settles on
            the one chosen. */}
        {queued && group ? (
          <CardStack printings={group.printings} density={density} dimmed index={entry.seq} />
        ) : (
          <CardArt card={card ?? group?.printings[0]} density={density} dimmed={queued} />
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">
            {name}
            {!group && !card && <span className="ml-1 opacity-75">(unavailable)</span>}
          </div>
          <CardMeta
            className="mt-1"
            cardNumber={group?.cardNumber ?? card?.cardNumber ?? "—"}
            colors={group?.colors ?? card?.colors ?? []}
            cardType={density === "compact" ? (group?.cardType ?? card?.cardType) : undefined}
            setName={group?.setName}
            iconSize={density === "touch" ? 13 : 15}
          >
            {/* Desktop keeps the pill inline; touch gives it its own line
                below, so the set name isn't squeezed down to an initial. */}
            {density === "compact" && printingBadge}
          </CardMeta>
          {density === "touch" && <div className="mt-1.5 flex">{printingBadge}</div>}

          {/* Inside the info column, so the options sit beside the art rather
              than under it — the card is tall and this space is otherwise dead. */}
          {showChips && (
            <div
              className={classes(
                "mt-2.5 flex min-w-0 items-center gap-2",
                density === "compact" && "flex-wrap"
              )}
            >
              {density === "compact" && (
                <span className="shrink-0 text-[11.5px] opacity-75">
                  {queued ? "Which printing?" : "Printing"}
                </span>
              )}
              <PrintingChips
                printings={group.printings}
                selectedId={entry.cardId ?? undefined}
                density={density}
                // Only the active row's chips carry number hints — pressing 2
                // always answers the top question, so hinting every row would
                // be a lie.
                showHints={isActiveQuestion}
                onPick={(cardId) => {
                  setExpanded(false);
                  assignPrinting(entry.key, cardId);
                  onCommitFocus();
                }}
              />
            </div>
          )}
        </div>

        {density === "compact" && (
          <QuantityStepper
            quantity={entry.quantity}
            label={name}
            density={density}
            onAdjust={(delta) => adjustQuantity(entry.key, delta)}
            onSet={(qty) => setQuantity(entry.key, qty)}
            onCommitFocus={onCommitFocus}
          />
        )}

        {density === "compact" && (
          <button
            type="button"
            aria-label={`Remove ${name} from session`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => removeEntry(entry.key)}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[9px] opacity-75 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <XIcon size={15} />
          </button>
        )}
      </div>

      {/* Last on touch, so opening the printing options — which live up in the
          info column — never pushes the stepper out from under your thumb. */}
      {density === "touch" && (
        <div className="relative mt-2.5">
          <QuantityStepper
            quantity={entry.quantity}
            label={name}
            density={density}
            fullWidth
            onAdjust={(delta) => adjustQuantity(entry.key, delta)}
            onSet={(qty) => setQuantity(entry.key, qty)}
            onCommitFocus={onCommitFocus}
          />
        </div>
      )}
    </li>
  );
}
