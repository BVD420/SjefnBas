"use client";

import { useApp } from "./AppProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="rounded-lg border border-[var(--ea-border)] bg-[var(--ea-card)] px-3 py-1.5 text-sm text-[var(--ea-text-muted)] transition hover:border-[var(--ea-primary)] hover:text-[var(--ea-primary)]"
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
