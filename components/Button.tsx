import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface ButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "transparent";
  icon?: LucideIcon;
  iconSize?: number;
  highContrast?: boolean;
}

export default function Button({
  onClick,
  children,
  className,
  variant = "primary",
  icon: Icon,
  iconSize = 16,
  highContrast = false,
}: ButtonProps) {
  const iconOnly = !!Icon && !children;
  return (
    <button
      onClick={onClick}
      className={classes(
        "flex shrink-0 gap-2 h-9 w-fit items-center justify-center select-none relative rounded-xl transition-all duration-150 cursor-pointer text-white",
        iconOnly ? "aspect-square" : "px-4",
        "backdrop-blur-md backdrop-saturate-150",
        "ring-1 ring-inset ring-white/10 dark:ring-black/15",
        "active:scale-[0.97]",
        variant === "primary" && "bg-blue-400/15 hover:bg-blue-400/25",
        variant === "secondary" && "bg-white/10 hover:bg-white/20 ",
        variant === "transparent" &&
          " hover:dark:bg-white/10 hover:bg-black/10 text-black dark:text-white",
        highContrast && "ring-black/10 dark:ring-white/15",
        className
      )}
    >
      {Icon && <Icon size={iconSize} className="shrink-0" />}
      {children}
    </button>
  );
}
