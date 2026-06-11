"use client";

import { useApp } from "./AppProvider";
import { CATEGORY_PROMPTS, t } from "@/lib/i18n";

type CategoryGridProps = {
  onSelect: (question: string) => void;
  disabled?: boolean;
};

const categories = [
  { id: "baggage" as const, titleKey: "catBaggage" as const, descKey: "catBaggageDesc" as const },
  { id: "delays" as const, titleKey: "catDelays" as const, descKey: "catDelaysDesc" as const },
  { id: "refunds" as const, titleKey: "catRefunds" as const, descKey: "catRefundsDesc" as const },
  { id: "notices" as const, titleKey: "catNotices" as const, descKey: "catNoticesDesc" as const },
];

function Icon({ id }: { id: string }) {
  const paths: Record<string, string> = {
    baggage:
      "M6 20h12v-2H6v2zm0-4h12v-8H6v8zm2-6h8l-2-4H10l-2 4z",
    delays: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 11h-4v-2h3V7h2v6z",
    refunds:
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    notices:
      "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  };
  return (
    <svg className="h-6 w-6 text-[var(--ea-primary)]" viewBox="0 0 24 24" fill="currentColor">
      <path d={paths[id]} />
    </svg>
  );
}

export function CategoryGrid({ onSelect, disabled }: CategoryGridProps) {
  const { locale } = useApp();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(CATEGORY_PROMPTS[cat.id])}
          className="group flex flex-col rounded-xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-4 text-left transition hover:border-[var(--ea-primary)] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon id={cat.id} />
          <h3 className="mt-3 font-semibold text-[var(--ea-text)]">
            {t(locale, cat.titleKey)}
          </h3>
          <p className="mt-1 text-sm text-[var(--ea-text-muted)]">
            {t(locale, cat.descKey)}
          </p>
        </button>
      ))}
    </div>
  );
}
