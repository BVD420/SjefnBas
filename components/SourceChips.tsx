"use client";

import { useApp } from "./AppProvider";
import { t } from "@/lib/i18n";
import type { SourceRef } from "@/lib/types";

type SourceChipsProps = {
  sources: SourceRef[];
};

export function SourceChips({ sources }: SourceChipsProps) {
  const { locale } = useApp();

  if (sources.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--ea-border)] pt-3">
      {sources.map((source) => {
        const isLive = source.doc_type === "live";
        return (
          <span
            key={source.name}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
              isLive
                ? "bg-[color-mix(in_srgb,var(--ea-live)_15%,transparent)] text-[var(--ea-live)] ring-1 ring-[color-mix(in_srgb,var(--ea-live)_40%,transparent)]"
                : "bg-[color-mix(in_srgb,var(--ea-policy)_8%,transparent)] text-[var(--ea-policy)] ring-1 ring-[color-mix(in_srgb,var(--ea-policy)_25%,transparent)]"
            }`}
          >
            <span className="font-semibold uppercase opacity-80">
              {isLive ? t(locale, "liveBadge") : t(locale, "policyBadge")}
            </span>
            <span className="opacity-60">·</span>
            <span>{source.name.replace(/_/g, " ")}</span>
          </span>
        );
      })}
    </div>
  );
}
