"use client";

import { type Theme, useTheme } from "@/lib/theme-context";
import { Menu, type MenuItem } from "@/components/Menu";
import { MoonIcon, SunIcon, SunMoonIcon, type LucideIcon } from "lucide-react";

const options: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: SunMoonIcon },
];

export function ThemeToggle({ highContrast = true }: { highContrast?: boolean }) {
  const { theme, setTheme } = useTheme();
  const current = options.find((o) => o.value === theme)!;

  const items: MenuItem[] = options.map((option) => ({
    label: option.label,
    icon: option.icon,
    active: theme === option.value,
    onClick: () => setTheme(option.value),
  }));

  return <Menu icon={current.icon} items={items} highContrast={highContrast} />;
}
