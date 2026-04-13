"use client";

import { useRef } from "react";
import { animate } from "animejs";
import Image from "next/image";

const SHINY_RARITIES = new Set(["RR", "R", "SR", "SEC", "OSR", "OUR", "UR", "HR", "SY", "S", "P"]);

interface CardImageProps {
  imageUrl: string;
  name: string;
  rarity: string;
}

export function CardImage({ imageUrl, name, rarity }: CardImageProps) {
  const cardRef = useRef<HTMLElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const isShiny = SHINY_RARITIES.has(rarity);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width: w, height: h } = el.getBoundingClientRect();
    const x = (e.clientX - left) / w - 0.5;
    const y = (e.clientY - top) / h - 0.5;
    animate(el, { rotateX: -y * 14, rotateY: x * 14, scale: 1.02, duration: 250, ease: "out(2)" });

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
    const el = cardRef.current;
    if (!el) return;
    animate(el, { rotateX: 0, rotateY: 0, scale: 1, duration: 900, ease: "out(4)" });
    if (shineRef.current) shineRef.current.style.opacity = "0";
  }

  return (
    <div className="shrink-0" style={{ perspective: "600px" }}>
      <figure
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        className="rounded-xl overflow-hidden relative m-0"
      >
        <Image src={imageUrl} alt={name} width={370} height={517} className="block" />
        {isShiny && (
          <div
            ref={shineRef}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              borderRadius: "1.25rem",
              mixBlendMode: "color-dodge",
              transition: "opacity 0.4s ease",
              pointerEvents: "none",
            }}
          />
        )}
      </figure>
    </div>
  );
}
