"use client";

import { useApp } from "./AppProvider";
import type { Locale } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useApp();

  function select(next: Locale) {
    setLocale(next);
  }

  return (
    <div className="flex rounded-lg border border-[var(--ea-border)] bg-[var(--ea-card)] p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => select("en")}
        className={`rounded-md px-2.5 py-1 transition ${
          locale === "en"
            ? "bg-[var(--ea-primary)] text-white"
            : "text-[var(--ea-text-muted)] hover:text-[var(--ea-text)]"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => select("nl")}
        className={`rounded-md px-2.5 py-1 transition ${
          locale === "nl"
            ? "bg-[var(--ea-primary)] text-white"
            : "text-[var(--ea-text-muted)] hover:text-[var(--ea-text)]"
        }`}
      >
        NL
      </button>
    </div>
  );
}
