"use client";

import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  children: ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, onOpen, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) onOpen?.();
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className={classes(
        "relative z-10 w-full max-w-md rounded-2xl shadow-xl",
        "bg-white dark:bg-zinc-900",
        "ring-1 ring-inset ring-black/10 dark:ring-white/10",
        "p-6",
        className
      )}>
        {children}
      </div>
    </div>,
    document.body
  );
}
