"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { classes } from "@/lib/classes";

interface AccordionItem {
  title: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!allowMultiple) next.clear();
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className={classes("flex flex-col divide-y divide-black/10 dark:divide-white/10 rounded-xl overflow-hidden", className)}>
      {items.map((item, i) => {
        const isOpen = openIndexes.has(i);
        return (
          <div key={i} className="bg-black/5 dark:bg-white/5">
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between gap-4 px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <ChevronDownIcon
                className={classes(
                  "shrink-0 w-4 h-4 opacity-50 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-3 pb-3 text-sm opacity-75">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
