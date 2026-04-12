import { CheckIcon } from "lucide-react";
import { classes } from "@/lib/classes";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  highContrast?: boolean;
  disabled?: boolean;
}

export default function Checkbox({ checked, onCheckedChange, label, className, highContrast = true, disabled = false }: CheckboxProps) {
  return (
    <label className={classes(
      "flex items-center gap-2.5 w-fit select-none",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      className
    )}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
      />
      <div className={classes(
        "h-5 w-5 shrink-0 rounded-md flex items-center justify-center transition-all duration-150",
        "ring-1 ring-inset",
        !disabled && !checked && "hover:ring-2",
        highContrast
          ? checked
            ? "bg-zinc-900 dark:bg-white ring-zinc-900 dark:ring-white hover:bg-zinc-700 dark:hover:bg-zinc-200"
            : "bg-black/5 dark:bg-white/5 ring-black/20 dark:ring-white/20 hover:ring-black/40 dark:hover:ring-white/40"
          : checked
            ? "bg-white ring-white hover:bg-white/80"
            : "bg-white/10 ring-white/30 hover:ring-white/60",
      )}>
        {checked && (
          <CheckIcon
            size={12}
            className={highContrast ? "text-white dark:text-zinc-900" : "text-zinc-900"}
          />
        )}
      </div>
      {label && (
        <span className={classes(
          "text-sm",
          highContrast ? "text-zinc-700 dark:text-zinc-300" : "text-white/80",
        )}>
          {label}
        </span>
      )}
    </label>
  );
}
