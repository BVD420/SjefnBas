"use client";

import { useState } from "react";
import { useApp } from "./AppProvider";
import { t } from "@/lib/i18n";
import { CompareTab } from "./CompareTab";
import { FlowDiagram } from "./FlowDiagram";
import { HelpCenter } from "./HelpCenter";
import { Hero } from "./Hero";
import { BookingLoginLink } from "./TripBanner";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { TripBanner } from "./TripBanner";

type Tab = "help" | "flow" | "compare";

export function AppShell() {
  const { locale } = useApp();
  const [tab, setTab] = useState<Tab>("help");

  const tabs: { id: Tab; labelKey: "navHelp" | "navHow" | "navCompare" }[] = [
    { id: "help", labelKey: "navHelp" },
    { id: "flow", labelKey: "navHow" },
    { id: "compare", labelKey: "navCompare" },
  ];

  return (
    <div className="min-h-screen bg-[var(--ea-surface)]">
      <header className="sticky top-0 z-50 border-b border-[var(--ea-border)] bg-[var(--ea-card)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ea-primary)] text-sm font-bold text-white">
              EA
            </div>
            <span className="hidden font-semibold text-[var(--ea-primary-dark)] sm:inline dark:text-[var(--ea-text)]">
              {t(locale, "brand")}
            </span>
          </div>

          <nav className="flex gap-1">
            {tabs.map(({ id, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  tab === id
                    ? "bg-[color-mix(in_srgb,var(--ea-primary)_12%,transparent)] text-[var(--ea-primary-dark)] dark:text-[var(--ea-primary)]"
                    : "text-[var(--ea-text-muted)] hover:text-[var(--ea-text)]"
                }`}
              >
                {t(locale, labelKey)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <BookingLoginLink />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <TripBanner />

      {tab === "help" && <Hero />}

      <main>
        {tab === "help" && <HelpCenter />}
        {tab === "flow" && <FlowDiagram />}
        {tab === "compare" && <CompareTab />}
      </main>
    </div>
  );
}
