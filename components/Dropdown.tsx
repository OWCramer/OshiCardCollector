"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { type LucideIcon, CheckIcon, ChevronDownIcon } from "lucide-react";
import { classes } from "@/lib/classes";

export type DropdownItem<T extends string = string> = {
  value: T;
  label: ReactNode;
  icon?: LucideIcon;
};

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface BaseProps<T extends string = string> {
  items: DropdownItem<T>[];
  className?: string;
  highContrast?: boolean;
}

interface SingleProps<T extends string = string> extends BaseProps<T> {
  multi?: false;
  value: T;
  onValueChange: (value: T) => void;
}

interface MultiProps<T extends string = string> extends BaseProps<T> {
  multi: true;
  value: T[];
  onValueChange: (value: T[]) => void;
}

type DropdownProps<T extends string = string> = SingleProps<T> | MultiProps<T>;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function Dropdown<T extends string = string>(props: DropdownProps<T>) {
  const { items, className, highContrast = true } = props;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  // Trigger label
  const triggerLabel = (() => {
    if (props.multi) {
      if (props.value.length === 0) return "All";
      if (props.value.length === 1) {
        return items.find((i) => i.value === props.value[0])?.label ?? "1 selected";
      }
      return `${props.value.length} selected`;
    }
    return items.find((i) => i.value === props.value)?.label ?? "Select...";
  })();

  // Trigger icon (single-select only)
  const triggerIcon = (() => {
    if (props.multi) return null;
    const current = items.find((i) => i.value === props.value);
    return current?.icon ?? null;
  })();

  function isSelected(itemValue: T) {
    if (props.multi) return props.value.includes(itemValue);
    return props.value === itemValue;
  }

  function handleItemClick(itemValue: T) {
    if (props.multi) {
      const next = props.value.includes(itemValue)
        ? props.value.filter((v) => v !== itemValue)
        : [...props.value, itemValue];
      props.onValueChange(next);
      // Stay open for multi-select
    } else {
      props.onValueChange(itemValue);
      setOpen(false);
    }
  }

  return (
    <div className={classes("relative w-48", className)} ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={classes(
          "flex items-center justify-between gap-4 h-9 px-4 w-full rounded-xl transition-all duration-150 cursor-pointer",
          "backdrop-blur-md backdrop-saturate-150",
          "ring-1 ring-inset active:scale-[0.97]",
          highContrast
            ? "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white ring-black/15 dark:ring-white/15"
            : "bg-white/10 hover:bg-white/20 text-white ring-white/20",
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          {triggerIcon && <TriggerIcon icon={triggerIcon} />}
          <span className="truncate">{triggerLabel}</span>
        </span>
        <ChevronDownIcon
          size={14}
          className={classes(
            "shrink-0 opacity-50 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Menu */}
      {open && (
        <div
          className={classes(
            "absolute z-50 mt-1 min-w-full w-max max-h-64 overflow-y-auto overscroll-contain rounded-xl shadow-lg p-1",
            "bg-white dark:bg-zinc-900",
            "ring-1 ring-inset ring-black/10 dark:ring-white/10",
          )}
        >
          {items.map((item) => {
            const selected = isSelected(item.value);
            return (
              <button
                key={item.value}
                onClick={() => handleItemClick(item.value)}
                className={classes(
                  "flex items-center gap-2 w-full px-3 min-h-9 py-1.5 rounded-lg text-left transition-colors duration-100 cursor-pointer",
                  "hover:bg-black/5 dark:hover:bg-white/10",
                  "text-zinc-800 dark:text-zinc-200",
                  selected && "font-medium",
                )}
              >
                {props.multi ? (
                  <MultiCheckbox checked={selected} highContrast={highContrast} />
                ) : (
                  item.icon && <item.icon size={16} className="shrink-0 opacity-60" />
                )}
                <span>{item.label}</span>
                {!props.multi && selected && (
                  <CheckIcon size={14} className="ml-auto shrink-0 opacity-60" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small helpers (avoid importing the full Checkbox component to     */
/*  keep the dropdown self-contained and visually consistent)         */
/* ------------------------------------------------------------------ */

function TriggerIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon size={16} className="shrink-0" />;
}

function MultiCheckbox({
  checked,
  highContrast,
}: {
  checked: boolean;
  highContrast: boolean;
}) {
  return (
    <div
      className={classes(
        "h-4 w-4 shrink-0 rounded flex items-center justify-center transition-all duration-150",
        "ring-1 ring-inset",
        highContrast
          ? checked
            ? "bg-zinc-900 dark:bg-white ring-zinc-900 dark:ring-white"
            : "bg-black/5 dark:bg-white/5 ring-black/20 dark:ring-white/20"
          : checked
            ? "bg-white ring-white"
            : "bg-white/10 ring-white/30",
      )}
    >
      {checked && (
        <CheckIcon
          size={10}
          className={highContrast ? "text-white dark:text-zinc-900" : "text-zinc-900"}
        />
      )}
    </div>
  );
}
