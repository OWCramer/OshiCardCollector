const COLOR_IMAGE_MAP: Record<string, string> = {
  blue: "/types/type_blue.png",
  green: "/types/type_green.png",
  purple: "/types/type_purple.png",
  red: "/types/type_red.png",
  white: "/types/type_white.png",
  yellow: "/types/type_yellow.png",
};

const COST_IMAGE_MAP: Record<string, string> = {
  blue: "/arts/arts_blue.png",
  green: "/arts/arts_green.png",
  purple: "/arts/arts_purple.png",
  red: "/arts/arts_red.png",
  white: "/arts/arts_white.png",
  yellow: "/arts/arts_yellow.png",
};

/** Returns the /types image path for a card's color, or null image if unknown. */
export function getColorImageSrc(color: string): string {
  return COLOR_IMAGE_MAP[color.toLowerCase()] ?? "/types/type_null.png";
}

/** Returns the /arts image path for a single art cost token, or null image if unknown. */
export function getArtCostImageSrc(cost: string): string {
  return COST_IMAGE_MAP[cost.toLowerCase()] ?? "/arts/arts_null.png";
}
