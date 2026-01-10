import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type AccentColor = "default" | "blue" | "green" | "purple" | "orange" | "rose";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("sibe-theme");
    return (stored as Theme) || "dark";
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const stored = localStorage.getItem("sibe-accent");
    return (stored as AccentColor) || "default";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("sibe-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("accent-default", "accent-blue", "accent-green", "accent-purple", "accent-orange", "accent-rose");
    root.classList.add(`accent-${accentColor}`);
    localStorage.setItem("sibe-accent", accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export type { AccentColor };
