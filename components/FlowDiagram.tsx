"use client";

import { useApp } from "./AppProvider";
import { t } from "@/lib/i18n";

function Step({
  n,
  title,
  body,
  badge,
}: {
  n: number;
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ea-primary)_15%,transparent)] text-sm font-bold text-[var(--ea-primary)]">
          {n}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[var(--ea-text)]">{title}</h3>
            {badge && (
              <span className="rounded-md bg-[var(--ea-surface)] px-2 py-0.5 text-xs text-[var(--ea-text-muted)]">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[var(--ea-text-muted)]">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FlowDiagram() {
  const { locale } = useApp();

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-10">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--ea-text)]">
          {t(locale, "flowTitle")}
        </h2>
        <p className="mt-2 text-sm text-[var(--ea-text-muted)]">
          Retrieval-Augmented Generation: we search official documents first,
          then generate an answer only from what was found.
        </p>
      </div>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ea-primary)]">
          Phase 1 — Setup
        </p>
        <Step
          n={1}
          title="12 airline documents"
          body="6 policies and 6 live notices covering baggage, EU261, refunds, strikes, and route changes."
        />
        <Step
          n={2}
          title="Chunk & embed"
          body="Documents are split into passages and converted to vectors via Voyage AI."
          badge="Voyage"
        />
        <Step
          n={3}
          title="Store in Supabase"
          body="Chunks and vectors are saved in Postgres with pgvector for semantic search."
          badge="Supabase"
        />
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ea-primary)]">
          Phase 2 — Every question
        </p>
        <Step
          n={1}
          title="Your question"
          body="You ask about delays, refunds, baggage, or travel notices."
        />
        <Step
          n={2}
          title="Find relevant passages"
          body="The question is embedded and matched against stored chunks. Top 4 closest passages are retrieved."
          badge="pgvector"
        />
        <Step
          n={3}
          title="Grounded answer"
          body="GPT answers using only those passages. Live notices override conflicting policies. Sources are cited below the answer."
          badge="OpenAI"
        />
      </section>

      <section className="rounded-2xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-5">
        <h3 className="font-semibold text-[var(--ea-text)]">
          Policy vs live notice
        </h3>
        <p className="mt-2 text-sm text-[var(--ea-text-muted)]">
          Stable policies can be overridden by time-sensitive notices — for
          example, non-refundable fares vs. Schiphol rebooking refunds.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--ea-policy)_25%,transparent)] p-3 text-sm">
            <span className="font-semibold text-[var(--ea-policy)]">
              {t(locale, "policyBadge")}
            </span>
            <p className="mt-1 text-[var(--ea-text-muted)]">
              04 refunds — standard fares non-refundable
            </p>
          </div>
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--ea-live)_35%,transparent)] p-3 text-sm">
            <span className="font-semibold text-[var(--ea-live)]">
              {t(locale, "liveBadge")}
            </span>
            <p className="mt-1 text-[var(--ea-text-muted)]">
              10 schiphol — full refund if rebooked without consent
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
