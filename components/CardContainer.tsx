import type { ReactNode } from "react";
import { classes } from "@/lib/classes";

interface CardContainerProps {
  children: ReactNode;
  className?: string;
}

export function CardContainer({ children, className }: CardContainerProps) {
  return (
    <div className={classes("rounded-xl bg-black/5 dark:bg-white/5 p-3", className)}>
      {children}
    </div>
  );
}
