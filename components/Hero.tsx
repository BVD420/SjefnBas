"use client";

import { useApp } from "./AppProvider";
import { t } from "@/lib/i18n";

export function Hero() {
  const { locale } = useApp();

  return (
    <section
      className="relative overflow-hidden px-6 py-14 text-white"
      style={{
        background: `linear-gradient(135deg, var(--ea-hero-from) 0%, var(--ea-hero-to) 100%)`,
      }}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
          {t(locale, "brand")}
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          {t(locale, "heroTitle")}
        </h1>
        <p className="mt-3 max-w-xl text-base text-white/80">
          {t(locale, "heroSubtitle")}
        </p>
      </div>
    </section>
  );
}
