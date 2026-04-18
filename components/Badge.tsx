interface BadgeProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function Badge({ children, onClick }: BadgeProps) {
  const interactive = !!onClick;

  if (interactive) {
    return (
      <button
        onClick={onClick}
        className="px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-black/10 dark:ring-white/10 hover:bg-black/10 dark:hover:bg-white/20 hover:ring-black/20 dark:hover:ring-white/20 transition-colors cursor-pointer"
      >
        {children}
      </button>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-black/10 dark:ring-white/10">
      {children}
    </span>
  );
}
