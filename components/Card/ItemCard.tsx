"use client";

import { useRef } from "react";
import { animate } from "animejs";
import Image from "next/image";
import type { GetAllCardsQuery } from "@/generated/graphql";

type CardNode = GetAllCardsQuery["cards"]["nodes"][number];

export const CARD_SIZES = {
  sm: { width: 160, height: 224 },
  md: { width: 200, height: 280 },
  lg: { width: 240, height: 335 },
  xl: { width: 264, height: 369 },
} as const;

export type CardSize = keyof typeof CARD_SIZES;

interface ItemCardProps {
  card: CardNode;
  size?: CardSize;
}

export function ItemCard({ card, size = "lg" }: ItemCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const { width, height } = CARD_SIZES[size];

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width: w, height: h } = el.getBoundingClientRect();
    const x = (e.clientX - left) / w - 0.5;
    const y = (e.clientY - top) / h - 0.5;
    animate(el, { rotateX: -y * 24, rotateY: x * 24, scale: 1.05, duration: 150, ease: "out(2)" });
  }

  function handleMouseLeave() {
    const el = cardRef.current;
    if (!el) return;
    animate(el, { rotateX: 0, rotateY: 0, scale: 1, duration: 600, ease: "out(4)" });
  }

  return (
    <div style={{ perspective: "600px", width, height }}>
      <button
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        className="rounded-lg overflow-hidden cursor-pointer"
      >
        {card.imageUrl && (
          <Image
            loading="eager"
            src={card.imageUrl}
            alt={card.name}
            width={width}
            height={height}
          />
        )}
      </button>
    </div>
  );
}
