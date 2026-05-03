import { OCG_CARD_SIZES } from "@/components/OCGCard";
import { type FullCardEntry } from "../CardLibrary";
export { BLOOM_ORDER } from "../cardOrdering";

export type DeckEntry = { card: FullCardEntry; quantity: number };
export type DeckTab = "holomem" | "cheer" | "support";

export interface TabProps {
  entries: DeckEntry[];
  onRemoveCard: (cardId: number) => void;
  onCardHover?: (card: FullCardEntry | null) => void;
}


export const OSHI_SCALE = 0.68;
const { width: XS_W, height: XS_H } = OCG_CARD_SIZES["xs"];
export const OSHI_W = Math.round(XS_W * OSHI_SCALE);
export const OSHI_H = Math.round(XS_H * OSHI_SCALE);
