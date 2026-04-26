"use client";

import { ReactNode, useEffect } from "react";

export function HoverProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    import("hover-tilt/web-component");
  }, []);
  return children;
}
