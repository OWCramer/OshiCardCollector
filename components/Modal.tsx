"use client";

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import Button from "@/components/Button";
import { classes } from "@/lib/classes";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  children: ReactNode;
  className?: string;
  title?: ReactNode;
}

export default function Modal({ isOpen, onClose, onOpen, children, className, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) onOpen?.();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const appRoot = document.getElementById("app-root");
    appRoot?.setAttribute("inert", "true");

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      appRoot?.removeAttribute("inert");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const root = typeof document !== "undefined" ? document.getElementById("modal-root") : null;
  if (!root) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={classes(
        "relative z-10 w-full sm:max-w-lg min-h-0 max-h-[90dvh] flex flex-col",
        "bg-white dark:bg-zinc-900",
        "rounded-t-2xl sm:rounded-2xl",
        "border border-black/10 dark:border-white/5",
        "shadow-xl overflow-hidden",
        className
      )}>
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 pb-0 shrink-0">
          {title ? (
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h2>
          ) : <div />}
          <Button icon={XIcon} variant="transparent" highContrast onClick={onClose} />
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    root
  );
}
