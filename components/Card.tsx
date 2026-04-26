import type { ReactNode } from "react";
import { classes } from "@/lib/classes";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={classes("rounded-xl bg-black/5 dark:bg-white/5 p-3", className)}>
      {children}
    </div>
  );
}
