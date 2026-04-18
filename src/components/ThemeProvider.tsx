import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

interface Ctx {
  theme: Theme;
  resolved: Resolved;
  setTheme: (t: Theme) => void;
}

const ThemeCtx = createContext<Ctx | null>(null);
const KEY = "propaai_theme";

function resolve(theme: Theme): Resolved {
  if (theme === "system") {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(KEY) as Theme) || "light";
  });
  const [resolved, setResolved] = useState<Resolved>(() => resolve(theme));

  useEffect(() => {
    const r = resolve(theme);
    setResolved(r);
    document.documentElement.classList.toggle("dark", r === "dark");
    localStorage.setItem(KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = resolve("system");
      setResolved(r);
      document.documentElement.classList.toggle("dark", r === "dark");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, resolved, setTheme: setThemeState }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error("useTheme must be used inside ThemeProvider");
  return v;
}
