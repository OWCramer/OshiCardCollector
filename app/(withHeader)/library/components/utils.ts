import type { CardMapEntry } from "@/lib/use-card-map";
import { BLOOM_ORDER } from "./types";
import type { Breakdown, CardEntry, SortField, SortOrder } from "./types";

export function sortEntries(items: CardEntry[], field: SortField, order: SortOrder): CardEntry[] {
  return [...items].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "name":       cmp = a.card.name.localeCompare(b.card.name); break;
      case "quantity":   cmp = a.entry.quantity - b.entry.quantity; break;
      case "color":      cmp = (a.card.colors[0] ?? "").localeCompare(b.card.colors[0] ?? ""); break;
      case "bloomLevel": cmp = (BLOOM_ORDER[a.card.bloomLevel ?? ""] ?? 99) - (BLOOM_ORDER[b.card.bloomLevel ?? ""] ?? 99); break;
      case "hp":         cmp = (a.card.hp ?? 0) - (b.card.hp ?? 0); break;
      case "cardNumber": cmp = a.card.cardNumber.localeCompare(b.card.cardNumber); break;
    }
    return order === "asc" ? cmp : -cmp;
  });
}

export function getGroupKey(card: CardMapEntry, breakdown: Breakdown): string {
  switch (breakdown) {
    case "name":       return card.name[0]?.toUpperCase() ?? "#";
    case "color":      return card.colors[0] ?? "Unknown";
    case "bloomLevel": return card.bloomLevel ?? "—";
    case "cardType":   return card.cardType;
    case "rarity":     return card.rarity;
    default:           return "";
  }
}

export function sortGroupKeys(keys: string[], breakdown: Breakdown): string[] {
  if (breakdown === "bloomLevel") {
    return [...keys].sort((a, b) => (BLOOM_ORDER[a] ?? 99) - (BLOOM_ORDER[b] ?? 99));
  }
  return [...keys].sort((a, b) => a.localeCompare(b));
}

export function formatGroupKey(key: string, breakdown: Breakdown): string {
  if (breakdown === "rarity") return key;
  return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
}
