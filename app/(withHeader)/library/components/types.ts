import type { Tab } from "@/components/Tabs";
import type { CardMapEntry } from "@/lib/use-card-map";
import type { LibraryEntry } from "@/api/library";

export type SortField = "name" | "quantity" | "color" | "bloomLevel" | "hp" | "cardNumber";
export type SortOrder = "asc" | "desc";
export type Breakdown = "none" | "name" | "color" | "bloomLevel" | "cardType" | "rarity" | "supportType";
export type SpecialFilter = "all" | "buzz" | "limited";

export type CardEntry = { card: CardMapEntry; entry: LibraryEntry };

export const BLOOM_ORDER: Record<string, number> = { Spot: 0, Debut: 1, "1st": 2, "2nd": 3 };

export const SORT_ITEMS: { value: SortField; label: string }[] = [
  { value: "name",       label: "Name" },
  { value: "quantity",   label: "Quantity" },
  { value: "color",      label: "Color" },
  { value: "bloomLevel", label: "Bloom Level" },
  { value: "hp",         label: "HP" },
  { value: "cardNumber", label: "Card #" },
];

export const BREAKDOWN_TABS: Tab<Breakdown>[] = [
  { value: "none",       label: "None" },
  { value: "name",       label: "Name" },
  { value: "color",      label: "Color" },
  { value: "bloomLevel", label: "Bloom" },
  { value: "cardType",    label: "Type" },
  { value: "rarity",      label: "Rarity" },
  { value: "supportType", label: "Support" },
];

export const SPECIAL_ITEMS: { value: SpecialFilter; label: string }[] = [
  { value: "all",     label: "All" },
  { value: "buzz",    label: "Buzz only" },
  { value: "limited", label: "Limited only" },
];
