import { OCG_CARD_SIZES, OCGCard, type OCGCardSize, type OCGCardData } from "@/components/OCGCard";
import { classes } from "@/lib/classes";
import type { Density } from "./types";

/** Phones get the smaller card so a row doesn't eat half the screen. */
export const CARD_ART_SIZE: Record<Density, OCGCardSize> = { compact: "xs", touch: "xxs" };

/**
 * The real card component, so importer rows get the holo shine and tilt.
 *
 * Art is doing identification work here: reprints of one card number are now
 * separate search rows differing only by illustration, so this needs to be big
 * enough to recognise at a glance.
 */
export function CardArt({
  card,
  density,
  dimmed,
}: {
  /** Undefined when a persisted draft references a card the catalog lost. */
  card?: OCGCardData;
  density: Density;
  dimmed?: boolean;
}) {
  const size = CARD_ART_SIZE[density];

  // OCGCard renders nothing without an image, so cover that case ourselves.
  if (!card?.imageUrl) {
    return (
      <div
        style={OCG_CARD_SIZES[size]}
        className="shrink-0 rounded-[4.55%/3.5%] bg-black/10 dark:bg-white/10 ring-1 ring-inset ring-black/10 dark:ring-white/10"
      />
    );
  }

  return (
    <div className={classes("shrink-0", dimmed && "opacity-75")}>
      <OCGCard card={card} size={size} />
    </div>
  );
}
