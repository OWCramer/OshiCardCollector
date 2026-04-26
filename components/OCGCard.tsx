"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./OCGCard.module.css";
import { classes } from "@/lib/classes";
import { Modal } from "@/components/Modal";
import { generateCardMask, getCachedMask } from "@/lib/mask-service";

/**
 * Fetches an image from a URL and converts it into a downsampled ImageData object.
 * * @param url - The source URL of the image
 * @param targetSize - The width/height to downsample to (default: 128)
 * @returns A Promise that resolves to the ImageData
 */
export async function urlToImageData(url: string): Promise<ImageData> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const img = document.createElement("img");

      img.onload = () => {
        // Dynamically grab the intrinsic dimensions of the image
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          reject(new Error("Browser does not support 2D canvas context."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        URL.revokeObjectURL(objectUrl);
        resolve(imageData);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to draw Blob to canvas.`));
      };

      img.src = objectUrl;
    });
  } catch (error) {
    console.error("urlToImageData completely failed:", error);
    throw error;
  }
}

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
  overlayText?: string;
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
  overlayText,
}: OCGCardProps) {
  const imageUrl = imageUrlProp ?? card?.imageUrl ?? "";
  const name = nameProp ?? card?.name ?? "";
  const rarity = rarityProp ?? card?.rarity ?? undefined;
  const href = hrefProp ?? (goToCard && card ? `/card/${card.id}` : undefined);
  const isHolo = SHINY_RARITIES.has(rarity ?? "") && shine;
  const [showModal, setShowModal] = useState(false);

  const hasRunRef = useRef(false);
  const [cardMaskUrl, setCardMaskUrl] = useState("");

  useEffect(() => {
    if (!imageUrl || hasRunRef.current) return;

    hasRunRef.current = true;
    const jobId = card?.id?.toString() || imageUrl;

    async function fetchMask() {
      try {
        // 1. FAST PATH: Check the persistent browser cache first!
        const cachedUrl = await getCachedMask(jobId);

        if (cachedUrl) {
          setCardMaskUrl(cachedUrl);
          return; // Skip everything else!
        }

        // 2. SLOW PATH: If not cached, extract pixels and run the AI
        const proxyUrl = `/_next/image?url=${encodeURIComponent(imageUrl)}&w=384&q=75`;
        const imageData = await urlToImageData(proxyUrl);
        const rawBlobUrl = await generateCardMask(jobId, imageData);

        setCardMaskUrl(rawBlobUrl);
      } catch (error) {
        console.error("Mask generation failed for", name, error);
      }
    }

    fetchMask();

    return () => {
      // This perfectly cleans up the ObjectURL, whether it came from the Worker OR the Cache!
      if (cardMaskUrl) URL.revokeObjectURL(cardMaskUrl);
    };
  }, [imageUrl, card?.id, cardMaskUrl, name]);

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
          shadowBlur={30}
          glareIntensity={isHolo ? 0 : glareIntensity}
          glareMask={isHolo ? `url(${cardMaskUrl})` : undefined}
          glareMaskMode="alpha"
          glareMaskComposite="intersect"
        >
          <Image
            src={imageUrl}
            alt={name}
            width={width}
            height={height}
            className="block rounded-[4.55%/3.5%]"
          />
          {overlayText && (
            <div
              className="absolute px-2 bottom-1.5 right-1.5 text-sm text-white rounded-lg bg-black/70"
              style={{ pointerEvents: "none" }}
            >
              {overlayText}
            </div>
          )}
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
