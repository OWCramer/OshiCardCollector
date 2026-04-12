"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { type LucideIcon, CheckIcon, ChevronDownIcon } from "lucide-react";
import { classes } from "@/lib/classes";

export type DropdownItem<T extends string = string> = {
  value: T;
  label: ReactNode;
  icon?: LucideIcon;
};

interface DropdownProps<T extends string = string> {
  value: T;
  items: DropdownItem<T>[];
  onValueChange: (value: T) => void;
  className?: string;
  highContrast?: boolean;
}

export function Dropdown<T extends string = string>({
  value,
  items,
  onValueChange,
  className,
  highContrast = true,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = items.find((i) => i.value === value);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={classes("relative w-48", className)} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={classes(
          "flex items-center justify-between gap-4 h-9 px-4 w-full rounded-xl transition-all duration-150 cursor-pointer",
          "backdrop-blur-md backdrop-saturate-150",
          "ring-1 ring-inset active:scale-[0.97]",
          highContrast
            ? "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white ring-black/15 dark:ring-white/15"
            : "bg-white/10 hover:bg-white/20 text-white ring-white/20"
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          {current?.icon && <current.icon size={16} className="shrink-0" />}
          <span className="truncate">{current?.label ?? "Select..."}</span>
        </span>
        <ChevronDownIcon
          size={14}
          className={classes(
            "shrink-0 opacity-50 transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={classes(
            "absolute z-50 mt-1 min-w-full w-max rounded-xl shadow-lg p-1",
            "bg-white dark:bg-zinc-900",
            "ring-1 ring-inset ring-black/10 dark:ring-white/10"
          )}
        >
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onValueChange(item.value);
                setOpen(false);
              }}
              className={classes(
                "flex items-center gap-2 w-full px-3 h-9 rounded-lg text-left transition-colors duration-100 cursor-pointer",
                "hover:bg-black/5 dark:hover:bg-white/10",
                "text-zinc-800 dark:text-zinc-200",
                item.value === value && "font-medium"
              )}
            >
              {item.icon && <item.icon size={16} className="shrink-0 opacity-60" />}
              <span>{item.label}</span>
              {item.value === value && (
                <CheckIcon size={14} className="ml-auto shrink-0 opacity-60" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
