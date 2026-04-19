import Link from "next/link";

interface BadgeProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

const interactiveClassName =
  "px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 opacity-75 ring-1 ring-inset ring-black/10 dark:ring-white/10 hover:bg-black/10 dark:hover:bg-white/20 hover:ring-black/20 dark:hover:ring-white/20 transition-colors cursor-pointer";

export function Badge({ children, onClick, href }: BadgeProps) {
  if (href) {
    return (
      <Link href={href} className={interactiveClassName}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={interactiveClassName}>
        {children}
      </button>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 opacity-75 ring-1 ring-inset ring-black/10 dark:ring-white/10">
      {children}
    </span>
  );
}
