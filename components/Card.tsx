import type { HTMLAttributes } from "react";
import { classes } from "@/lib/classes";

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={classes("rounded-xl bg-black/5 dark:bg-white/5 p-3", className)}>
      {children}
    </div>
  );
}
