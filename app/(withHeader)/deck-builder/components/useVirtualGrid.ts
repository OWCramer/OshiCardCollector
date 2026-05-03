import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualGridOptions {
  itemWidth: number;
  itemHeight: number;
  gap: number;
  overscan?: number;
}

export function useVirtualGrid<T>(items: T[], { itemWidth, itemHeight, gap, overscan = 3 }: VirtualGridOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columns = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
  }, [containerWidth, itemWidth, gap]);

  const gridWidth = columns * itemWidth + (columns - 1) * gap;
  const gridOffset = Math.max(0, (containerWidth - gridWidth) / 2);

  const rows = useMemo(() => {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += columns) {
      result.push(items.slice(i, i + columns));
    }
    return result;
  }, [items, columns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => itemHeight + gap,
    overscan,
    getScrollElement: () => scrollRef.current,
  });

  return { scrollRef, rows, virtualizer, gridWidth, gridOffset };
}
