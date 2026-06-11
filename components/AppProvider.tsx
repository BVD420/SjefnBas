"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type Locale } from "@/lib/i18n";

type Theme = "light" | "dark";

type AppContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const storedLocale = localStorage.getItem("locale") as Locale | null;
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedLocale === "en" || storedLocale === "nl") {
      setLocaleState(storedLocale);
    }
    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeState(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    }
  }, []);

  function setLocale(locale: Locale) {
    setLocaleState(locale);
    localStorage.setItem("locale", locale);
  }

  function setTheme(theme: Theme) {
    setThemeState(theme);
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <AppContext.Provider
      value={{ locale, setLocale, theme, setTheme, toggleTheme }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
