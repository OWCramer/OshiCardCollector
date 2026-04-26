import type { CardMapEntry } from "@/lib/use-card-map";
import type { Breakdown, CardEntry, SortField, SortOrder } from "./types";
import { BLOOM_ORDER } from "./types";

export function sortEntries(items: CardEntry[], field: SortField, order: SortOrder): CardEntry[] {
  return [...items].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "name":
        cmp = a.card.name.localeCompare(b.card.name);
        break;
      case "quantity":
        cmp = a.entry.quantity - b.entry.quantity;
        break;
      case "color":
        cmp = (a.card.colors[0] ?? "").localeCompare(b.card.colors[0] ?? "");
        break;
      case "bloomLevel":
        cmp =
          (BLOOM_ORDER[a.card.bloomLevel ?? ""] ?? 99) -
          (BLOOM_ORDER[b.card.bloomLevel ?? ""] ?? 99);
        break;
      case "hp":
        cmp = (a.card.hp ?? 0) - (b.card.hp ?? 0);
        break;
      case "cardNumber":
        cmp = a.card.cardNumber.localeCompare(b.card.cardNumber);
        break;
    }
    return order === "asc" ? cmp : -cmp;
  });
}

export function getGroupKey(card: CardMapEntry, breakdown: Breakdown): string {
  switch (breakdown) {
    case "name":
      return card.name[0]?.toUpperCase() ?? "#";
    case "cardName":
      return card.name;
    case "color":
      return card.colors[0] ?? "Unknown";
    case "bloomLevel":
      return card.bloomLevel ?? "—";
    case "cardType":
      return card.cardType;
    case "rarity":
      return card.rarity;
    case "supportType":
      return card.supportType ?? "—";
    default:
      return "";
  }
}

export function sortGroupKeys(keys: string[], breakdown: Breakdown): string[] {
  if (breakdown === "bloomLevel") {
    return [...keys].sort((a, b) => (BLOOM_ORDER[a] ?? 99) - (BLOOM_ORDER[b] ?? 99));
  }
  return [...keys].sort((a, b) => {
    if (a === "—") return 1;
    if (b === "—") return -1;
    return a.localeCompare(b);
  });
}

export function formatGroupKey(key: string, breakdown: Breakdown): string {
  if (breakdown === "rarity" || breakdown === "cardName") return key;
  if (key === "—") return key;
  return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
}

// ---- flat grouping ----

export interface FlatGroup {
  key: string;
  label: string;
  entries: CardEntry[];
}

export function buildFlatGroups(entries: CardEntry[], breakdowns: Breakdown[]): FlatGroup[] {
  if (breakdowns.length === 0) return [];
  return buildLevel(entries, breakdowns, 0, []);
}

function buildLevel(
  entries: CardEntry[],
  breakdowns: Breakdown[],
  level: number,
  labelPath: string[]
): FlatGroup[] {
  const breakdown = breakdowns[level];
  const map = new Map<string, CardEntry[]>();

  for (const e of entries) {
    const key = getGroupKey(e.card, breakdown);
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(e);
  }

  const result: FlatGroup[] = [];
  for (const key of sortGroupKeys(Array.from(map.keys()), breakdown)) {
    const group = map.get(key);
    if (!group) continue;
    const path = [...labelPath, formatGroupKey(key, breakdown)];
    if (level + 1 < breakdowns.length) {
      result.push(...buildLevel(group, breakdowns, level + 1, path));
    } else {
      result.push({ key: path.join("\0"), label: path.join(" · "), entries: group });
    }
  }
  return result;
}
