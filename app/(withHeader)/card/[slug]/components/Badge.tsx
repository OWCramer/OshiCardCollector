export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-black/10 dark:ring-white/10">
      {children}
    </span>
  );
}
