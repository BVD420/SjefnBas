"use client";

import { useRef } from "react";
import { useApp } from "./AppProvider";
import { DEMO_QUESTIONS, t } from "@/lib/i18n";
import { CategoryGrid } from "./CategoryGrid";
import { ChatPanel, type ChatPanelHandle } from "./ChatPanel";

export function HelpCenter() {
  const { locale } = useApp();
  const chatRef = useRef<ChatPanelHandle>(null);

  function handleCategory(question: string) {
    chatRef.current?.setInput(question);
    chatRef.current?.sendMessage(question);
  }

  function handleExample(question: string) {
    chatRef.current?.sendMessage(question);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[var(--ea-text)]">
            {t(locale, "navHelp")}
          </h2>
          <CategoryGrid onSelect={handleCategory} />
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--ea-text-muted)]">
            {t(locale, "examplesTitle")}
          </h2>
          <div className="space-y-2">
            {DEMO_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => handleExample(question)}
                className="block w-full rounded-xl border border-[var(--ea-border)] bg-[var(--ea-card)] px-4 py-3 text-left text-sm text-[var(--ea-text)] transition hover:border-[var(--ea-primary)]"
              >
                {question}
              </button>
            ))}
          </div>
        </section>
      </div>

      <ChatPanel ref={chatRef} />
    </div>
  );
}
