import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { classes } from "@/lib/classes";

interface ButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "transparent" | "destructive";
  icon?: LucideIcon;
  iconSize?: number;
  highContrast?: boolean;
  href?: string;
}

export default function Button({
  onClick,
  children,
  className,
  variant = "primary",
  icon: Icon,
  iconSize = 16,
  highContrast = false,
  href,
}: ButtonProps) {
  const iconOnly = !!Icon && !children;

  const resolvedClass = classes(
    "flex shrink-0 gap-2 h-9 w-fit items-center justify-center select-none relative rounded-xl transition-all duration-150 cursor-pointer text-white",
    iconOnly ? "aspect-square" : "px-4",
    "backdrop-blur-md backdrop-saturate-150",
    "ring-1 ring-inset ring-white/10 dark:ring-black/15",
    "active:scale-[0.97]",
    variant === "primary" && "bg-blue-400/15 hover:bg-blue-400/25",
    variant === "secondary" && "bg-white/10 hover:bg-white/20",
    variant === "transparent" && "hover:dark:bg-white/10 hover:bg-black/10",
    variant === "destructive" && "bg-red-500/15 hover:bg-red-500/25 text-red-500 ring-red-500/20 dark:ring-red-500/50",
    variant !== "destructive" && highContrast && "ring-black/10 dark:ring-white/15 text-black dark:text-white",
    className
  );

  const content = (
    <>
      {Icon && <Icon size={iconSize} className="shrink-0" />}
      {children}
    </>
  );

  if (href) {
    return <Link href={href} className={resolvedClass}>{content}</Link>;
  }

  return (
    <button onClick={onClick} className={resolvedClass}>
      {content}
    </button>
  );
}
