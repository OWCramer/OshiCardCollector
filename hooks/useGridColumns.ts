"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Observes a container element and returns the number of columns
 * that fit given cardWidth + gap, plus the element's offsetTop for
 * scroll-margin calculations.
 *
 * Uses a callback ref so it correctly re-attaches when the DOM
 * element changes (e.g. conditional rendering between layouts).
 */
export function useGridColumns(cardWidth: number, gap: number) {
  const [columns, setColumns] = useState(1);
  const [scrollMargin, setScrollMargin] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const elRef = useRef<HTMLDivElement | null>(null);

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      elRef.current = node;
      if (!node) return;

      const observer = new ResizeObserver(([entry]) => {
        const cols = Math.max(
          1,
          Math.floor((entry.contentRect.width + gap) / (cardWidth + gap)),
        );
        setColumns(cols);
        setScrollMargin(node.offsetTop);
      });

      observer.observe(node);
      observerRef.current = observer;
    },
    [cardWidth, gap],
  );

  return { ref, columns, scrollMargin };
}
