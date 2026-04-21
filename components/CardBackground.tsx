"use client";

import { CardType, useGetAllCardsQuery } from "@/generated/graphql";
import { animate } from "animejs";
import { useEffect, useMemo, useRef } from "react";

const CARD_W = 130;
const CARD_H = 182;
const GAP = 12;
const CELL_H = CARD_H + GAP;
const STRIP_LEN = 21;
const NUM_STRIPS = 34;
const DURATION_MS = 55_000;

interface StripProps {
  cards: string[];
  phaseRatio: number;
}

function CardStrip({ cards, phaseRatio }: StripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const totalH = STRIP_LEN * CELL_H;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctrl = animate(el, {
      translateY: [0, -totalH],
      duration: DURATION_MS,
      ease: "linear",
      loop: true,
    });
    ctrl.seek(phaseRatio * DURATION_MS);
    return () => ctrl.pause();
  }, [phaseRatio, totalH]);

  // 3× content so strip bottom stays below viewport for the full animation cycle
  const tripled = [...cards, ...cards, ...cards];

  return (
    <div
      ref={ref}
      style={{ display: "flex", flexDirection: "column", gap: GAP, flexShrink: 0, width: CARD_W }}
    >
      {tripled.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt=""
          width={CARD_W}
          height={CARD_H}
          loading="eager"
          style={{ borderRadius: 8, display: "block", flexShrink: 0, width: CARD_W, height: CARD_H, objectFit: "cover" }}
        />
      ))}
    </div>
  );
}

export function CardBackground() {
  const { data } = useGetAllCardsQuery({ variables: { pageSize: 0 } });

  const strips = useMemo(() => {
    const allCards = (data?.cards?.nodes ?? [])
      .filter((c) => c.imageUrl && c.cardType !== CardType.Support)
      .map((c) => c.imageUrl!);
    if (allCards.length === 0) return [];

    // Fisher-Yates shuffle so placement is random on each load
    const cards = [...allCards];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return Array.from({ length: NUM_STRIPS }, (_, i) => ({
      cards: Array.from({ length: STRIP_LEN }, (_, j) =>
        cards[(i * STRIP_LEN + j) % cards.length]
      ),
      phaseRatio: i / NUM_STRIPS,
    }));
  }, [data]);

  if (strips.length === 0) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) rotate(45deg)",
          display: "flex",
          flexDirection: "row",
          gap: GAP,
          filter: "blur(3px)",
          opacity: 0.3,
        }}
      >
        {strips.map(({ cards, phaseRatio }, idx) => (
          <CardStrip key={idx} cards={cards} phaseRatio={phaseRatio} />
        ))}
      </div>
    </div>
  );
}
