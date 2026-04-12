import { type LucideIcon } from "lucide-react";
import { classes } from "@/lib/classes";

export type Tab<T extends string = string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

interface TabsProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  tabs: Tab<T>[];
  className?: string;
}

export default function Tabs<T extends string = string>({ value, onValueChange, tabs, className }: TabsProps<T>) {
  return (
    <div className={classes(
      "flex items-center gap-0.5 p-1 rounded-xl w-fit",
      "bg-black/5 dark:bg-white/5",
      "ring-1 ring-inset ring-black/10 dark:ring-white/10",
      className
    )}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onValueChange(tab.value)}
            className={classes(
              "flex items-center gap-2 px-4 h-7 rounded-lg text-sm transition-all duration-150 cursor-pointer select-none",
              active
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
            )}
          >
            {tab.icon && <tab.icon size={14} className="shrink-0" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
