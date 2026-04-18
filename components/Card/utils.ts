const COLOR_IMAGE_MAP: Record<string, string> = {
  blue: "/types/type_blue.png",
  green: "/types/type_green.png",
  purple: "/types/type_purple.png",
  red: "/types/type_red.png",
  white: "/types/type_white.png",
  yellow: "/types/type_yellow.png",
};

const DUAL_COLOR_IMAGE_MAP: Record<string, string> = {
  "blue_red": "/types/type_blue_red.png",
  "white_green": "/types/type_white_green.png",
};

const DAMAGE_BONUS_IMAGE_MAP: Record<string, string> = {
  blue: "/arts_bonus/tokkou_50_blue.png",
  green: "/arts_bonus/tokkou_50_green.png",
  purple: "/arts_bonus/tokkou_50_purple.png",
  red: "/arts_bonus/tokkou_50_red.png",
  white: "/arts_bonus/tokkou_50_white.png",
  yellow: "/arts_bonus/tokkou_50_yellow.png",
};

const COST_IMAGE_MAP: Record<string, string> = {
  blue: "/arts/arts_blue.png",
  green: "/arts/arts_green.png",
  purple: "/arts/arts_purple.png",
  red: "/arts/arts_red.png",
  white: "/arts/arts_white.png",
  yellow: "/arts/arts_yellow.png",
};

/**
 * Returns an array of /types image paths for a card's color(s).
 * Accepts a single color string or an array of colors.
 * For known dual-color combos, returns a single combo icon.
 * For unknown combos, returns one icon per color.
 */
export function getColorImageSrcs(color: string | string[]): string[] {
  const colors = Array.isArray(color) ? color : [color];
  const key = colors.map((c) => c.toLowerCase()).join("_");
  if (DUAL_COLOR_IMAGE_MAP[key]) return [DUAL_COLOR_IMAGE_MAP[key]];
  return colors.map((c) => COLOR_IMAGE_MAP[c.toLowerCase()] ?? "/types/type_null.png");
}

/** Returns the /arts image path for a single art cost token, or null image if unknown. */
export function getArtCostImageSrc(cost: string): string {
  return COST_IMAGE_MAP[cost.toLowerCase()] ?? "/arts/arts_null.png";
}

/** Returns the /arts_bonus image path for a damage bonus color. */
export function getDamageBonusImageSrc(color: string): string {
  return DAMAGE_BONUS_IMAGE_MAP[color.toLowerCase()] ?? null;
}
