"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./OCGCard.module.css";
import { classes } from "@/lib/classes";

export const OCG_CARD_SIZES = {
  sm: { width: 160, height: 224 },
  lg: { width: 240, height: 335 },
  detail: { width: 370, height: 517 },
} as const;

export type OCGCardSize = keyof typeof OCG_CARD_SIZES;

// Minimal structural type — both GetAllCardsQuery nodes and GetCardQuery cards satisfy this.
export interface OCGCardData {
  id: number;
  name: string;
  imageUrl?: string | null;
  rarity?: string | null;
}

const SHINY_RARITIES = new Set(["RR", "R", "SR", "SEC", "OSR", "OUR", "UR", "HR", "SY", "S", "P"]);

interface OCGCardProps {
  /** Pass a GQL card object to auto-populate imageUrl, name, rarity, and href. */
  card?: OCGCardData;
  /** Overrides card.imageUrl. */
  imageUrl?: string;
  /** Overrides card.name. */
  name?: string;
  /** Overrides card.rarity. */
  rarity?: string;
  /** Overrides the auto-derived /card/:id href. */
  href?: string;
  size?: OCGCardSize;
  shiny?: boolean;
  onClick?: () => void;
  className?: string;
}

export function OCGCard({
  card,
  imageUrl: imageUrlProp,
  name: nameProp,
  rarity: rarityProp,
  href: hrefProp,
  size = "lg",
  shiny = true,
  onClick,
  className,
}: OCGCardProps) {
  const imageUrl = imageUrlProp ?? card?.imageUrl ?? "";
  const name = nameProp ?? card?.name ?? "";
  const rarity = rarityProp ?? card?.rarity ?? undefined;
  const href = hrefProp ?? (card ? `/card/${card.id}` : undefined);
  const isHolo = SHINY_RARITIES.has(rarity ?? "") && shiny;

  // Nothing to render without an image.
  if (!imageUrl) return null;

  const { width, height } = OCG_CARD_SIZES[size];

  const cardEl = (
    // Setting width and height on the surrounding div is needed for virtualization to function properly.
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      key={card?.id}
      onClick={onClick}
      className={href ? undefined : className}
    >
      <hover-tilt
        className={classes(
          "block h-full w-full [&::part(container)]:rounded-[4.55%/3.5%]",
          isHolo ? `${styles.holo}` : undefined
        )}
        exitDelay={0}
        scaleFactor={1.03}
        shadow
        shadow-blur={30}
        glare-intensity={0.5}
      >
        <Image
          src={imageUrl}
          alt={name}
          width={width}
          height={height}
          className="block rounded-[4.55%/3.5%]"
        />
      </hover-tilt>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ flexShrink: 0, display: "block" }} className={className}>
        {cardEl}
      </Link>
    );
  }

  return cardEl;
}
