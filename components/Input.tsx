import { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
  highContrast?: boolean;
  label?: string;
}

export default function Input({ className, highContrast = true, label, ...props }: InputProps) {
  return (
    <div className={classes("flex flex-col gap-1.5 w-48", className)}>
      {label && (
        <label className="text-sm text-zinc-600 dark:text-zinc-400">{label}</label>
      )}
      <input
        {...props}
        className={classes(
          "h-9 px-4 w-full rounded-xl outline-none transition-all duration-150",
          "ring-1 ring-inset",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          highContrast
            ? "bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ring-black/15 dark:ring-white/15 focus:ring-black/30 dark:focus:ring-white/30"
            : "bg-white/10 text-white placeholder:text-white/40 ring-white/20 focus:ring-white/40",
        )}
      />
    </div>
  );
}
