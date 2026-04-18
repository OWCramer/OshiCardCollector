"use client";

import { useState } from "react";
import { HeartIcon, PlusIcon, CopyIcon, CheckIcon } from "lucide-react";

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

function ActionButton({ icon: Icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center w-7 h-7 my-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-150 active:scale-[0.97]"
    >
      <Icon size={16} className="shrink-0" />
    </button>
  );
}

export function CardActions({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`flex items-center h-9 px-1 gap-0.5 rounded-xl backdrop-blur-md backdrop-saturate-150 ring-1 ring-inset ring-black/10 dark:ring-white/15 text-black dark:text-white ${className ?? ""}`}>
      <ActionButton icon={HeartIcon} label="Favourite" />
      <div className="w-px h-5 bg-black/10 dark:bg-white/10" />
      <ActionButton icon={PlusIcon} label="Add to collection" />
      <div className="w-px h-5 bg-black/10 dark:bg-white/10" />
      <ActionButton icon={copied ? CheckIcon : CopyIcon} label={copied ? "Copied!" : "Copy link"} onClick={handleCopy} />
    </div>
  );
}
