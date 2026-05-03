/** Canonical sort-order maps shared across card library, deck preview, and mobile components. */

export const COLOR_ORDER: Record<string, number> = {
  WHITE: 0,
  RED: 1,
  BLUE: 2,
  GREEN: 3,
  YELLOW: 4,
  PURPLE: 5,
};

export const BLOOM_ORDER: Record<string, number> = {
  "Spot": 0,
  "Debut": 1,
  "1st": 2,
  "2nd": 3,
};

export const TYPE_ORDER: Record<string, number> = {
  OSHI: 0,
  HOLOMEM: 1,
  SUPPORT: 2,
  CHEER: 3,
};
