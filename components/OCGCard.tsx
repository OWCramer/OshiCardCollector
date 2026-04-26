"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { classes } from "@/lib/classes";
import { animate } from "animejs";

export const OCG_CARD_SIZES = {
  sm: { width: 160, height: 224 },
  lg: { width: 240, height: 335 },
  detail: { width: 370, height: 517 },
} as const;

export type OCGCardSize = keyof typeof OCG_CARD_SIZES;
export type OCGCardParallaxStrength = "low" | "med" | "high";

const SHINY_RARITIES = new Set(["RR", "R", "SR", "SEC", "OSR", "OUR", "UR", "HR", "SY", "S", "P"]);

// Parallax intensity per strength level per size.
// "detail" cards are always more subtle relative to their physical size on screen.
const PARALLAX_CONFIG: Record<
  OCGCardParallaxStrength,
  Record<OCGCardSize, { rotate: number; scale: number }>
> = {
  high: {
    sm: { rotate: 24, scale: 1.05 },
    lg: { rotate: 24, scale: 1.05 },
    detail: { rotate: 14, scale: 1.02 },
  },
  med: {
    sm: { rotate: 14, scale: 1.03 },
    lg: { rotate: 14, scale: 1.03 },
    detail: { rotate: 8, scale: 1.015 },
  },
  low: {
    sm: { rotate: 7, scale: 1.015 },
    lg: { rotate: 7, scale: 1.015 },
    detail: { rotate: 4, scale: 1.008 },
  },
};

interface OCGCardProps {
  imageUrl: string;
  name: string;
  size?: OCGCardSize;
  parallax?: boolean;
  parallaxStrength?: OCGCardParallaxStrength;
  shine?: boolean;
  rarity?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function OCGCard({
  imageUrl,
  name,
  size = "lg",
  parallax = false,
  parallaxStrength = "high",
  shine = false,
  rarity,
  href,
  onClick,
  className,
}: OCGCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const { width, height } = OCG_CARD_SIZES[size];
  const isShiny = shine && !!rarity && SHINY_RARITIES.has(rarity);
  const { rotate, scale } = PARALLAX_CONFIG[parallaxStrength][size];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!parallax) return;
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width: w, height: h } = el.getBoundingClientRect();
    const x = (e.clientX - left) / w - 0.5;
    const y = (e.clientY - top) / h - 0.5;
    animate(el, {
      rotateX: -y * rotate,
      rotateY: x * rotate,
      scale,
      duration: 150,
      ease: "out(2)",
    });

    if (isShiny && shineRef.current) {
      const xPct = (x + 0.5) * 100;
      const yPct = (y + 0.5) * 100;
      const hue = Math.round(xPct * 3.6);
      shineRef.current.style.opacity = "1";
      shineRef.current.style.background = [
        `radial-gradient(circle at ${xPct}% ${yPct}%, rgba(255,255,255,0.1) 0%, transparent 10%)`,
        `linear-gradient(${hue}deg, rgba(255,0,128,0.18) 0%, rgba(255,165,0,0.18) 20%, rgba(0,255,128,0.18) 40%, rgba(0,200,255,0.18) 60%, rgba(180,0,255,0.18) 80%, rgba(255,0,128,0.18) 90%)`,
      ].join(", ");
    }
  }

  function handleMouseLeave() {
    if (!parallax) return;
    const el = cardRef.current;
    if (!el) return;
    animate(el, { rotateX: 0, rotateY: 0, scale: 1, duration: 600, ease: "out(4)" });
    if (shineRef.current) shineRef.current.style.opacity = "0";
  }

  const card = (
    <div
      style={{ perspective: "600px", width, height, flexShrink: 0 }}
      className={!href ? className : undefined}
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transformStyle: "preserve-3d", willChange: "transform", width, height }}
        className={classes(
          "overflow-hidden relative",
          (onClick || href) && "cursor-pointer",
          (onClick || href) && !parallax && "transition-transform duration-200 hover:scale-[1.02]"
        )}
      >
        <Image src={imageUrl} alt={name} width={width} height={height} className="block" />
        {isShiny && (
          <div
            ref={shineRef}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              borderRadius: "0.75rem",
              mixBlendMode: "color-dodge",
              transition: "opacity 0.4s ease",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ flexShrink: 0, display: "block" }} className={className}>
        {card}
      </Link>
    );
  }

  return card;
}
