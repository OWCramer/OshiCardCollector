import { InputHTMLAttributes, Ref } from "react";
import { classes } from "@/lib/classes";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  /** Applied to the wrapper, which owns the field's width. */
  className?: string;
  /** Applied to the field itself, for dense contexts that need to override h-9. */
  inputClassName?: string;
  ref?: Ref<HTMLInputElement>;
  highContrast?: boolean;
  label?: string;
}

export function Input({
  className,
  inputClassName,
  highContrast = true,
  label,
  ...props
}: InputProps) {
  return (
    <div className={classes("flex flex-col gap-1.5 w-48", className)}>
      {label && <label className="text-sm opacity-75">{label}</label>}
      <input
        {...props}
        className={classes(
          "h-9 px-4 w-full rounded-xl outline-none transition-all duration-150 backdrop-blur-md backdrop-saturate-150",
          "ring-1 ring-inset",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          highContrast
            ? "bg-black/5 dark:bg-white/5 placeholder:opacity-75 ring-black/15 dark:ring-white/15 focus:ring-black/30 dark:focus:ring-white/30"
            : "bg-white/10 text-white placeholder:text-white/40 ring-white/20 focus:ring-white/40",
          inputClassName
        )}
      />
    </div>
  );
}
