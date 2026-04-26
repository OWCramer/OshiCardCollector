"use client";

import React, {useRef, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./OCGCard.module.css";
import {classes} from "@/lib/classes";
import {Modal} from "@/components/Modal";

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
  goToCard?: boolean;
  size?: OCGCardSize;
  shine?: boolean;
  tiltFactor?: number;
  scaleFactor?: number;
  glareIntensity?: number;
  onClick?: () => void;
  className?: string;
}

export function OCGCard({
  card,
  imageUrl: imageUrlProp,
  name: nameProp,
  rarity: rarityProp,
  href: hrefProp,
  goToCard = false,
  size = "lg",
  shine = true,
  tiltFactor = 1,
  scaleFactor = 1.03,
  glareIntensity = 0.5,
  onClick,
  className,
}: OCGCardProps) {
  const imageUrl = imageUrlProp ?? card?.imageUrl ?? "";
  const name = nameProp ?? card?.name ?? "";
  const rarity = rarityProp ?? card?.rarity ?? undefined;
  const href = hrefProp ?? (goToCard && card ? `/card/${card.id}` : undefined);
  const isHolo = SHINY_RARITIES.has(rarity ?? "") && shine;
  const [showModal, setShowModal] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = useRef(false);

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchMovedRef.current = false;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);

    if (dx > 8 || dy > 8) {
      touchMovedRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (!touchMovedRef.current) {
      globalThis.window.setTimeout(() => setShowModal(true), 100);
    }

    touchStartRef.current = null;
    touchMovedRef.current = false;
  };

  // Nothing to render without an image.
  if (!imageUrl) return null;

  const { width, height } = OCG_CARD_SIZES[size];

  const cardEl = (
    // Setting width and height on the surrounding div is needed for virtualization to function properly.
    <>
      <Modal title="Card preview" isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="flex w-full h-full items-center justify-center">
          <div className="w-fit h-full items-center justify-center">
            <hover-tilt
              className={classes(
                "block h-full w-full [&::part(container)]:rounded-[4.55%/3.5%]",
                isHolo ? `${styles.holo}` : undefined
              )}
              exitDelay={0}
              tiltFactor={0.5}
              shadow
              shadow-blur={30}
              glare-intensity={glareIntensity}
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
        </div>
      </Modal>
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        key={card?.id}
        onClick={onClick}
        className={href ? undefined : className}
        onTouchStart={goToCard ? undefined : handleTouchStart}
        onTouchMove={goToCard ? undefined : handleTouchMove}
        onTouchEnd={goToCard ? undefined : handleTouchEnd}
      >
        <hover-tilt
          className={classes(
            "block h-full w-full touch-pan-y [&::part(container)]:rounded-[4.55%/3.5%]",
            "[@media(hover:none)_and_(pointer:coarse)]:pointer-events-none",
            isHolo ? `${styles.holo}` : undefined
          )}
          exitDelay={0}
          tiltFactor={tiltFactor}
          scaleFactor={scaleFactor}
          shadow
          shadow-blur={30}
          glare-intensity={glareIntensity}
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
    </>
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
