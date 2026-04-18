import { classes } from "@/lib/classes";

interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return <hr className={classes("border-none h-px bg-black/10 dark:bg-white/10", className)} />;
}
