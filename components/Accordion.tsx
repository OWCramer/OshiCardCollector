"use client";

import { type ReactNode, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { classes } from "@/lib/classes";
import { Divider } from "@/components/Divider";

// ---- shared ----

interface AccordionItemProps {
  title: ReactNode;
  content: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, content, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="bg-black/5 dark:bg-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center cursor-pointer justify-between gap-4 px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDownIcon
          className={classes(
            "shrink-0 w-4 h-4 opacity-50 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && <Divider />}
      {isOpen && <div className="px-3 pb-3 text-sm mt-2">{content}</div>}
    </div>
  );
}

// ---- single mode ----

interface SingleAccordionProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  /** Open on first render (uncontrolled). */
  defaultOpen?: boolean;
  /** Controlled open state. Provide alongside onOpenChange to take full control. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ---- group mode ----

interface AccordionGroup {
  title: ReactNode;
  content: ReactNode;
}

interface GroupAccordionProps {
  groups: AccordionGroup[];
  className?: string;
  /** Allow multiple groups to be open at the same time. */
  allowMultiple?: boolean;
  /** Indexes open on first render (uncontrolled). */
  defaultOpen?: number[];
  /** Controlled open indexes. Provide alongside onOpenChange to take full control. */
  open?: number[];
  onOpenChange?: (open: number[]) => void;
}

// ---- union ----

type AccordionProps = SingleAccordionProps | GroupAccordionProps;

function isSingle(props: AccordionProps): props is SingleAccordionProps {
  return "children" in props;
}

export function Accordion(props: AccordionProps) {
  if (isSingle(props)) {
    return <SingleAccordion {...props} />;
  }
  return <GroupAccordion {...props} />;
}

// ---- implementations ----

function SingleAccordion({
  title,
  children,
  className,
  defaultOpen = false,
  open,
  onOpenChange,
}: SingleAccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  function toggle() {
    if (!isControlled) setInternalOpen((prev) => !prev);
    onOpenChange?.(!isOpen);
  }

  return (
    <div className={classes("rounded-xl overflow-hidden", className)}>
      <AccordionItem title={title} content={children} isOpen={isOpen} onToggle={toggle} />
    </div>
  );
}

function GroupAccordion({
  groups,
  className,
  allowMultiple = false,
  defaultOpen,
  open,
  onOpenChange,
}: GroupAccordionProps) {
  const [internalOpen, setInternalOpen] = useState<Set<number>>(() => new Set(defaultOpen ?? []));

  const isControlled = open !== undefined;
  const openIndexes = isControlled ? new Set(open) : internalOpen;

  function toggle(index: number) {
    const next = new Set(openIndexes);
    if (next.has(index)) {
      next.delete(index);
    } else {
      if (!allowMultiple) next.clear();
      next.add(index);
    }
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(Array.from(next));
  }

  return (
    <div
      className={classes(
        "flex flex-col divide-y divide-black/10 dark:divide-white/10 rounded-xl overflow-hidden",
        className
      )}
    >
      {groups.map((item, i) => (
        <AccordionItem
          key={i}
          title={item.title}
          content={item.content}
          isOpen={openIndexes.has(i)}
          onToggle={() => toggle(i)}
        />
      ))}
    </div>
  );
}
