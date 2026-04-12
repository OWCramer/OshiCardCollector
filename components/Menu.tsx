"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { type LucideIcon, CheckIcon } from "lucide-react";
import Button from "@/components/Button";

export type MenuItem = {
  label: ReactNode;
  icon?: LucideIcon;
  onClick: () => void;
  active?: boolean;
};

export type MenuSection = {
  label?: string;
  items: MenuItem[];
};

interface MenuProps {
  items?: MenuItem[];
  sections?: MenuSection[];
  icon?: LucideIcon;
  trigger?: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "transparent" | "button";
  align?: "left" | "right" | "auto";
  highContrast?: boolean;
  menuClassName?: string;
  children?: ReactNode;
}

export default function Menu({ items, sections, icon, trigger, children, className, variant = "transparent", align = "auto", highContrast = true, menuClassName }: MenuProps) {
  const triggerVariant = variant === "button" ? "primary" : variant;
  const [open, setOpen] = useState(false);
  const [resolvedAlign, setResolvedAlign] = useState<"left" | "right">("right");
  const ref = useRef<HTMLDivElement>(null);

  const resolvedSections: MenuSection[] = sections ?? (items ? [{ items }] : []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleOpen() {
    if (align === "auto" && ref.current) {
      const { left, width } = ref.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - (left + width);
      setResolvedAlign(spaceOnRight >= 144 ? "left" : "right");
    } else if (align !== "auto") {
      setResolvedAlign(align);
    }
    setOpen(!open);
  }

  function renderItem(item: MenuItem, i: number) {
    return (
      <Button
        key={i}
        icon={item.icon}
        variant="transparent"
        highContrast={highContrast}
        className="w-full ring-0 shadow-none backdrop-blur-none backdrop-saturate-0 justify-start rounded-lg"
        onClick={() => {
          item.onClick();
          setOpen(false);
        }}
      >
        {item.label}
        {item.active && <CheckIcon className="ml-auto h-4 w-4" />}
      </Button>
    );
  }

  return (
    <div className={classes("relative", className)} ref={ref}>
      {children ? (
        <div onClick={handleOpen} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button
          icon={icon}
          variant={triggerVariant}
          onClick={handleOpen}
          highContrast={highContrast}
        >
          {trigger}
        </Button>
      )}

      {open && (
        <div className={classes(
          "absolute flex flex-col z-50 mt-1 w-36 rounded-xl shadow-lg p-1",
          menuClassName,
          "bg-white dark:bg-zinc-900 ring-black/10 dark:ring-white/10",
          "ring-1 ring-inset",
          resolvedAlign === "left" ? "left-0" : "right-0"
        )}>
          {resolvedSections.map((section, si) => (
            <div key={si}>
              {si > 0 && <div className="my-1 border-t border-black/10 dark:border-white/10" />}
              {section.label && (
                <p className="px-3 pt-1 pb-0.5 text-xs text-zinc-400 dark:text-zinc-500">{section.label}</p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map(renderItem)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
