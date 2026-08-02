import { classes } from "@/lib/classes";

interface DividerProps {
  className?: string;
  text?: string;
}

export function Divider({ className, text }: DividerProps) {

  if (text) {
    return (
      <div className={classes("flex flex-row w-full items-center gap-2", className)}>
        <hr className="border-none w-full h-px bg-black/10 dark:bg-white/10" />
        <p className="font-mono text-sm opacity-75">{text}</p>
        <hr className="border-none w-full h-px bg-black/10 dark:bg-white/10" />
      </div>
    );
  }

  return <hr className={classes("border-none h-px bg-black/10 dark:bg-white/10", className)} />;
}
