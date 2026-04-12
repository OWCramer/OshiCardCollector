"use client";

import { useRef, useEffect, useCallback } from "react";

const SCROLL_RANGE = 80;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Drives a scroll-linked animation that moves the search bar
 * from a "top slot" into a "sidebar slot" over SCROLL_RANGE px.
 *
 * Returns three refs to attach to the DOM:
 *  - searchRef  → the search input wrapper (the thing that moves)
 *  - topSlotRef → its resting position at scroll-top
 *  - sidebarSlotRef → its destination in the sidebar
 */
export function useScrollLinkedSearch(enabled: boolean) {
  const searchRef = useRef<HTMLDivElement>(null);
  const topSlotRef = useRef<HTMLDivElement>(null);
  const sidebarSlotRef = useRef<HTMLDivElement>(null);

  const update = useCallback(() => {
    const searchEl = searchRef.current;
    const topSlot = topSlotRef.current;
    const sidebarSlot = sidebarSlotRef.current;
    if (!searchEl || !topSlot || !sidebarSlot) return;

    const t = Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE));
    const topRect = topSlot.getBoundingClientRect();
    const sidebarRect = sidebarSlot.getBoundingClientRect();

    // At the very top, drop back to normal flow so macOS rubber-band works
    if (t === 0) {
      searchEl.style.cssText = "";
      sidebarSlot.style.height = "0";
      sidebarSlot.style.marginBottom = "0";
      return;
    }

    searchEl.style.position = "fixed";
    searchEl.style.left = `${lerp(topRect.left, sidebarRect.left, t)}px`;
    searchEl.style.top = `${lerp(topRect.top, sidebarRect.top, t)}px`;
    searchEl.style.width = `${lerp(topRect.width, sidebarRect.width, t)}px`;
    searchEl.style.zIndex = "35";

    sidebarSlot.style.height = `${lerp(0, 36, t)}px`;
    sidebarSlot.style.marginBottom = `${lerp(0, 16, t)}px`;
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Clean up when switching to mobile
      if (searchRef.current) searchRef.current.style.cssText = "";
      return;
    }

    const onScroll = () => requestAnimationFrame(update);

    // Set initial position
    requestAnimationFrame(update);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, update]);

  return { searchRef, topSlotRef, sidebarSlotRef };
}
