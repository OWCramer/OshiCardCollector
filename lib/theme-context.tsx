"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function getStoredTheme(): Theme {
  if (typeof globalThis.window === "undefined") return "system";

  const stored = localStorage.getItem("theme");
  return isTheme(stored) ? stored : "system";
}

function getIsDarkMode(theme: Theme) {
  if (theme === "dark") return true;
  if (theme === "light") return false;

  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const isDarkMode = getIsDarkMode(theme);
  document.documentElement.classList.toggle("dark", isDarkMode);
  return isDarkMode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof globalThis.window === "undefined" ? false : applyTheme(getStoredTheme())
  );

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(applyTheme(newTheme));
  }, []);

  useEffect(() => {
    if (theme !== "system") return;

    const mq = globalThis.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      setIsDarkMode(applyTheme("system"));
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return <ThemeContext value={{ theme, setTheme, isDarkMode }}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
