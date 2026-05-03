import Link from "next/link";

type BadgeColor = "default" | "amber" | "green" | "red" | "blue";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  onClick?: () => void;
  href?: string;
}

const COLOR_CLASSES: Record<BadgeColor, string> = {
  default:
    "bg-black/5 dark:bg-white/10 text-inherit opacity-75 ring-black/10 dark:ring-white/10",
  amber:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30",
  green:
    "bg-green-500/15 text-green-600 dark:text-green-400 ring-green-500/30",
  red: "bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/30",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-blue-500/30",
};

const INTERACTIVE_BASE =
  "hover:brightness-95 dark:hover:brightness-110 transition-colors cursor-pointer";

export function Badge({ children, color = "default", onClick, href }: BadgeProps) {
  const colorClass = COLOR_CLASSES[color];
  const base = `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${colorClass}`;

  if (href) {
    return (
      <Link href={href} className={`${base} ${INTERACTIVE_BASE}`}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} ${INTERACTIVE_BASE}`}>
        {children}
      </button>
    );
  }

  return <span className={base}>{children}</span>;
}
