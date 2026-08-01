"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { OCG_CARD_SIZES } from "@/components/OCGCard";
import type { CardMapEntry } from "@/lib/use-card-map";
import { CARD_ART_SIZE, CardArt } from "./CardArt";
import type { Density } from "./types";

/** How much smaller each card behind the front sits. */
const SCALE_STEP = 0.035;
/** Visible sliver of each card behind, as a fraction of the front card. */
const PEEK_X = 0.12;
const PEEK_Y = 0.06;
/** Degrees of fan per card back, to sell it as a physical stack. */
const ROTATE_STEP = 1.5;
/** Counter-rotation at the peak of the tuck-away flick. */
const FLICK_DEG = 2.5;

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Offsets are derived from the peek rather than picked by eye.
 *
 * With a top-left transform origin, scaling a card down pulls its right and
 * bottom edges *inward* by `scale × size` — which silently eats the offset. At
 * a 4.5% step that cancelled a 7px nudge almost exactly, leaving the cards
 * behind about a pixel of visible edge. Solving for a guaranteed sliver:
 *
 *   rightEdge(s) = x(s) + scale(s)·W  and we want  rightEdge(s) = W + s·peek
 *   ⇒ x(s) = s · (peek + step·W)
 */
const slotScale = (slot: number) => 1 - slot * SCALE_STEP;
const slotX = (slot: number, width: number) => slot * (PEEK_X * width + SCALE_STEP * width);
const slotY = (slot: number, height: number) => slot * (PEEK_Y * height + SCALE_STEP * height);
/** Seconds one card takes to travel from the front to the back. */
const MOTION_S = 0.62;
/** Milliseconds a card rests at the front before cycling. */
const HOLD_MS = 2200;
/** Per-row offset so neighbouring stacks don't flip in unison. */
const STAGGER_MS = 320;

/**
 * A cycling stack of every printing of one card.
 *
 * Each rarity has its own artwork — all 616 multi-printing groups in the
 * catalog have genuinely distinct images — so a single static thumbnail hides
 * most of what you need to identify what you actually pulled. The stack rotates
 * front-to-back so every design gets seen.
 *
 * Hovering holds the rotation at the next rest point (an in-flight card always
 * finishes its travel) and lets OCGCard's own tilt take over the front card.
 * Passing `focusCardId` drives it to a specific printing and holds it there —
 * that's how hovering a rarity chip brings its artwork to the front.
 */
export function CardStack({
  printings,
  density,
  focusCardId,
  index = 0,
}: {
  printings: CardMapEntry[];
  density: Density;
  /** Pins a printing at the front, using the same travel animation. */
  focusCardId?: number | null;
  /** Row position, used only to desynchronise the timers. */
  index?: number;
}) {
  const count = printings.length;
  const reduceMotion = useReducedMotion();
  const [front, setFront] = useState(0);
  const [hovered, setHovered] = useState(false);

  const focusIndex =
    focusCardId == null ? -1 : printings.findIndex((p) => p.id === focusCardId);

  // Adjusting state during render rather than in an effect — React's documented
  // pattern for deriving from changed props. Writing `front` here (instead of
  // rendering off a separate "effective front") means that when the hover ends,
  // cycling resumes from the card you were looking at rather than snapping back.
  const [lastFocus, setLastFocus] = useState<number | null | undefined>(focusCardId);
  if (focusCardId !== lastFocus) {
    setLastFocus(focusCardId);
    if (focusIndex >= 0) setFront(focusIndex);
  }

  // Scheduling the next advance from an effect keyed on `front` means a hover
  // simply cancels the pending timer. Whatever is already travelling is driven
  // by the `animate` prop and finishes regardless — which is exactly the
  // "pause, but not mid-motion" behaviour we want.
  const paused = hovered || focusIndex >= 0 || reduceMotion || count < 2;
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(
      () => setFront((f) => (f + 1) % count),
      HOLD_MS + (index % 4) * STAGGER_MS
    );
    return () => clearTimeout(id);
  }, [front, paused, count, index]);

  // Nothing to cycle through, so skip the stack machinery entirely.
  if (count < 2) {
    return <CardArt card={printings[0]} density={density} />;
  }

  const { width, height } = OCG_CARD_SIZES[CARD_ART_SIZE[density]];
  const depth = count - 1;

  return (
    <div
      className="relative shrink-0"
      // The box has to cover the full fan, or the deepest card gets clipped by
      // the results panel — its overflow-y resolves overflow-x to auto, so a
      // stray pixel becomes a horizontal scrollbar. Rotation about the top-left
      // origin pushes the bottom down by w·sin(fan), and the flick swings the
      // right edge out by h·sin(flick).
      style={{
        width: width + depth * PEEK_X * width + height * Math.sin(rad(FLICK_DEG)),
        height: height + depth * PEEK_Y * height + width * Math.sin(rad(depth * ROTATE_STEP)),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {printings.map((printing, i) => {
        const slot = (i - front + count) % count;
        const isFront = slot === 0;
        // After the first rotation the card in the last slot is always the one
        // that just left the front, so it's the one that needs the travel path.
        const wrapping = slot === depth && front !== 0;

        return (
          <motion.div
            key={printing.id}
            className="absolute top-0 left-0 origin-top-left"
            // Only the front card should catch the pointer, or the tilt would
            // fire on whichever partially-covered card is under the cursor.
            style={{ pointerEvents: isFront ? "auto" : "none" }}
            animate={{
              x: slotX(slot, width),
              y: slotY(slot, height),
              scale: slotScale(slot),
              // A little flick as it tucks away, settling on the fan angle.
              rotate: wrapping
                ? [0, -FLICK_DEG, slot * ROTATE_STEP]
                : slot * ROTATE_STEP,
              zIndex: count - slot,
            }}
            transition={{
              default: { duration: MOTION_S, ease: [0.32, 0.72, 0, 1] },
              // Snap the stacking order at the midpoint instead of tweening it.
              // Changing it up front would pop the outgoing card behind its
              // neighbour while the two still overlap almost exactly.
              zIndex: { duration: 0, delay: MOTION_S * 0.45 },
            }}
          >
            <CardArt card={printing} density={density} />
          </motion.div>
        );
      })}
    </div>
  );
}
