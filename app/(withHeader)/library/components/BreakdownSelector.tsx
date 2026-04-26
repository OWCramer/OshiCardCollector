"use client";

import { type ReactNode, useState } from "react";
import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react";
import { Tabs } from "@/components/Tabs";
import { Dropdown } from "@/components/Dropdown";
import { classes } from "@/lib/classes";
import { useBreakpoint } from "@/lib/useBreakpoint";
import type { Breakdown } from "./types";
import { BREAKDOWN_SUB_TABS, BREAKDOWN_TABS } from "./types";

interface BreakdownSelectorProps {
  breakdowns: Breakdown[];
  onChange: (breakdowns: Breakdown[]) => void;
  trailing?: ReactNode;
}

export function BreakdownSelector({ breakdowns, onChange, trailing }: BreakdownSelectorProps) {
  const isMedium = useBreakpoint("md");
  const firstValue = breakdowns[0] ?? "none";
  const hasBreakdown = breakdowns.length > 0;
  const hasSubRows = breakdowns.length > 1;
  const [subRowsVisible, setSubRowsVisible] = useState(true);

  function handleFirstChange(v: string) {
    if (v === "none") {
      onChange([]);
    } else {
      onChange([v as Breakdown, ...breakdowns.slice(1)]);
    }
  }

  function handleSubChange(level: number, v: string) {
    const next = [...breakdowns];
    next[level] = v as Breakdown;
    onChange(next);
  }

  function addLevel() {
    const used = new Set(breakdowns);
    const next = BREAKDOWN_SUB_TABS.find((t) => !used.has(t.value))?.value ?? BREAKDOWN_SUB_TABS[0].value;
    onChange([...breakdowns, next as Breakdown]);
  }

  function removeLevel(level: number) {
    onChange([...breakdowns.slice(0, level), ...breakdowns.slice(level + 1)]);
  }

  const canAddLevel = hasBreakdown && breakdowns.length < 5;

  return (
    <div className="flex flex-col gap-2">
      {/* Primary row */}
      <div className="flex items-center justify-between gap-x-4 gap-y-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isMedium ? (
            <div className="overflow-x-auto overflow-y-hidden">
              <Tabs value={firstValue} onValueChange={handleFirstChange} tabs={BREAKDOWN_TABS} />
            </div>
          ) : (
            <Dropdown value={firstValue} onValueChange={handleFirstChange} items={BREAKDOWN_TABS} className="flex-1" />
          )}
          {hasBreakdown && breakdowns.length === 1 && canAddLevel && (
            <button
              onClick={addLevel}
              title="Add grouping level"
              className="shrink-0 h-9 w-9 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity"
            >
              <PlusIcon size={14} />
            </button>
          )}
          {hasSubRows && (
            <button
              onClick={() => setSubRowsVisible((v) => !v)}
              title={subRowsVisible ? "Hide sub-groups" : "Show sub-groups"}
              className={classes(
                "h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ring-1 ring-inset transition-colors relative",
                "ring-black/15 dark:ring-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
              )}
            >
              <ChevronDownIcon
                size={14}
                className={classes("transition-transform duration-200", subRowsVisible && "rotate-180")}
              />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
            </button>
          )}
        </div>
        {trailing && <div className="flex items-center gap-2 shrink-0">{trailing}</div>}
      </div>

      {/* Sub-level rows */}
      {subRowsVisible && breakdowns.slice(1).map((bd, i) => {
        const level = i + 1;
        const isLast = level === breakdowns.length - 1;
        return (
          <div key={level} className="flex items-center gap-1 min-w-0 w-full">
            {isMedium ? (
              <div className="overflow-x-auto overflow-y-hidden">
                <Tabs value={bd} onValueChange={(v) => handleSubChange(level, v)} tabs={BREAKDOWN_SUB_TABS} />
              </div>
            ) : (
              <Dropdown value={bd} onValueChange={(v) => handleSubChange(level, v)} items={BREAKDOWN_SUB_TABS} className="flex-1" />
            )}
            <button
              onClick={() => removeLevel(level)}
              title="Remove this grouping level"
              className="shrink-0 h-9 w-9 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity"
            >
              <XIcon size={14} />
            </button>
            {isLast && canAddLevel && (
              <button
                onClick={addLevel}
                title="Add grouping level"
                className="shrink-0 h-9 w-9 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity"
              >
                <PlusIcon size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

