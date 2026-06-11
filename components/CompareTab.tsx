"use client";

import { useState } from "react";
import { useApp } from "./AppProvider";
import { DEMO_QUESTIONS, t } from "@/lib/i18n";
import type { SourceRef } from "@/lib/types";
import { SourceChips } from "./SourceChips";

async function streamAnswer(
  url: string,
  question: string,
  onText: (text: string) => void,
  onSources?: (sources: SourceRef[]) => void
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok || !res.body) {
    throw new Error(await res.text());
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") continue;

      const data = JSON.parse(payload) as {
        type: string;
        sources?: SourceRef[];
        text?: string;
      };

      if (data.type === "sources" && data.sources && onSources) {
        onSources(data.sources);
      } else if (data.type === "text" && data.text) {
        content += data.text;
        onText(content);
      }
    }
  }

  return content;
}

export function CompareTab() {
  const { locale } = useApp();
  const [selected, setSelected] = useState(DEMO_QUESTIONS[0]);
  const [baseline, setBaseline] = useState("");
  const [rag, setRag] = useState("");
  const [sources, setSources] = useState<SourceRef[]>([]);
  const [running, setRunning] = useState(false);

  async function runCompare() {
    setRunning(true);
    setBaseline("");
    setRag("");
    setSources([]);

    try {
      await Promise.all([
        streamAnswer("/api/baseline", selected, setBaseline),
        streamAnswer("/api/chat", selected, setRag, setSources),
      ]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[var(--ea-text)]">
          {t(locale, "compareTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ea-text-muted)]">
          {t(locale, "compareSubtitle")}
        </p>
      </div>

      <div className="mb-6 space-y-3">
        {DEMO_QUESTIONS.map((q) => (
          <label
            key={q}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
              selected === q
                ? "border-[var(--ea-primary)] bg-[color-mix(in_srgb,var(--ea-primary)_8%,transparent)]"
                : "border-[var(--ea-border)] bg-[var(--ea-card)]"
            }`}
          >
            <input
              type="radio"
              name="compare-question"
              checked={selected === q}
              onChange={() => setSelected(q)}
              className="mt-1"
            />
            <span className="text-sm text-[var(--ea-text)]">{q}</span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={runCompare}
        disabled={running}
        className="rounded-xl bg-[var(--ea-primary-dark)] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {running ? t(locale, "compareRunning") : t(locale, "compareRun")}
      </button>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--ea-text-muted)]">
            {t(locale, "compareWithout")}
          </h3>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ea-text)]">
            {baseline || (running ? "..." : "—")}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--ea-primary)] bg-[var(--ea-card)] p-5 ring-1 ring-[color-mix(in_srgb,var(--ea-primary)_20%,transparent)]">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--ea-primary)]">
            {t(locale, "compareWith")}
          </h3>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ea-text)]">
            {rag || (running ? "..." : "—")}
          </p>
          {sources.length > 0 && <SourceChips sources={sources} />}
        </div>
      </div>
    </div>
  );
}
