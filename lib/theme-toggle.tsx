"use client";

import { useEffect, useRef, useState } from "react";
import { type Theme, useTheme } from "@/lib/theme-context";
import Button from "@/components/Button";
import { CheckIcon, LucideIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";

const options: { value: Theme; label: string; icon: LucideIcon }[] = [
  {
    value: "light",
    label: "Light",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Dark",
    icon: MoonIcon,
  },
  {
    value: "system",
    label: "System",
    icon: SunMoonIcon,
  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = options.find((o) => o.value === theme)!;

  return (
    <div className="relative" ref={ref}>
      <Button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5"
        aria-expanded={open}
        aria-haspopup="listbox"
        variant="transparent"
        icon={current.icon}
        highContrast
      >
        <span className="sr-only">Theme: {current.label}</span>
      </Button>

      {open && (
        <div className="absolute flex flex-col gap-1 right-0 z-50 mt-1 w-36 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {options.map((option) => (
            <Button
              key={option.value}
              onClick={() => {
                setTheme(option.value);
                setOpen(false);
              }}
              variant="transparent"
              className="w-full ring-0 justify-start"
              icon={option.icon}
            >
              <span className="sr-only">{option.label}</span>
              {option.label}
              {theme === option.value && <CheckIcon className="ml-auto h-4 w-4" />}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
