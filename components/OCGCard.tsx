"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./OCGCard.module.css";
import { classes } from "@/lib/classes";
import { useBreakpoint } from "@/lib/useBreakpoint";

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
  /** Pass a GQL card object to autopopulate imageUrl, name, rarity, and href. */
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
  shine?: boolean;
  pressToTilt?: boolean;
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
  shine = true,
  onClick,
  className,
}: OCGCardProps) {
  const imageUrl = imageUrlProp ?? card?.imageUrl ?? "";
  const name = nameProp ?? card?.name ?? "";
  const rarity = rarityProp ?? card?.rarity ?? undefined;
  const href = hrefProp ?? (card ? `/card/${card.id}` : undefined);
  const isHolo = SHINY_RARITIES.has(rarity ?? "") && shine;
  const isMobile = !useBreakpoint("sm");

  const [pressTiltActive, setPressTiltActive] = useState(false);
  const pressTimerRef = useRef<number | null>(null);
  const pressStartRef = useRef<{ x: number; y: number } | null>(null);

  // Nothing to render without an image.
  if (!imageUrl) return null;

  const { width, height } = OCG_CARD_SIZES[size];

  const clearPressTilt = () => {
    if (pressTimerRef.current !== null) {
      globalThis.window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    pressStartRef.current = null;
    setPressTiltActive(false);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile || event.pointerType !== "touch") return;

    pressStartRef.current = { x: event.clientX, y: event.clientY };

    pressTimerRef.current = globalThis.window.setTimeout(() => {
      setPressTiltActive(true);
    }, 275);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile || !pressStartRef.current || pressTiltActive) return;

    const dx = Math.abs(event.clientX - pressStartRef.current.x);
    const dy = Math.abs(event.clientY - pressStartRef.current.y);

    // If the user starts scrolling, cancel tilt activation.
    if (dx > 8 || dy > 8) {
      clearPressTilt();
    }
  };

  const image = (
    <Image
      src={imageUrl}
      alt={name}
      width={width}
      height={height}
      className="block rounded-[4.55%/3.5%]"
    />
  );

  const shouldRenderTilt = !isMobile || pressTiltActive;

  const cardEl = (
    // Setting width and height on the surrounding div is needed for virtualization to function properly.
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      key={card?.id}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearPressTilt}
      onPointerCancel={clearPressTilt}
      onPointerLeave={clearPressTilt}
      className={classes("touch-pan-y", href ? undefined : className)}
    >
      {shouldRenderTilt ? (
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
          {image}
        </hover-tilt>
      ) : (
        image
      )}
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
