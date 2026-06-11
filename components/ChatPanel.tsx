"use client";

import { FormEvent, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { useApp } from "./AppProvider";
import { t } from "@/lib/i18n";
import type { SourceRef } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];
};

export type ChatPanelHandle = {
  sendMessage: (question: string) => void;
  setInput: (value: string) => void;
};

export const ChatPanel = forwardRef<ChatPanelHandle>(function ChatPanel(_, ref) {
  const { locale } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ingest")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.chunks === "number" && data.chunks > 0) {
          setReady(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || streaming || !ready) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "", sources: [] },
    ]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sources: SourceRef[] = [];
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
            message?: string;
          };

          if (data.type === "sources" && data.sources) {
            sources = data.sources;
          } else if (data.type === "text" && data.text) {
            content += data.text;
          } else if (data.type === "error" && data.message) {
            content += data.message;
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content, sources } : m
            )
          );
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  error instanceof Error ? error.message : "Something went wrong.",
              }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  useImperativeHandle(ref, () => ({
    sendMessage,
    setInput,
  }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex h-full min-h-[480px] flex-col rounded-2xl border border-[var(--ea-border)] bg-[var(--ea-card)] shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)]">
      <div className="border-b border-[var(--ea-border)] px-5 py-4">
        <h2 className="font-semibold text-[var(--ea-text)]">
          {t(locale, "chatTitle")}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!ready ? (
          <p className="text-center text-sm text-[var(--ea-text-muted)]">
            {t(locale, "chatLoading")}
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-[var(--ea-text-muted)]">
            {t(locale, "chatPlaceholder")}
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                sources={message.sources}
                isStreaming={
                  streaming &&
                  message.role === "assistant" &&
                  index === messages.length - 1
                }
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--ea-border)] p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              ready ? t(locale, "chatPlaceholder") : t(locale, "chatLoading")
            }
            disabled={streaming || !ready}
            className="flex-1 rounded-xl border border-[var(--ea-border)] bg-[var(--ea-surface)] px-4 py-2.5 text-sm text-[var(--ea-text)] outline-none focus:ring-2 focus:ring-[var(--ea-primary)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !ready || !input.trim()}
            className="rounded-xl bg-[var(--ea-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t(locale, "send")}
          </button>
        </div>
      </form>
    </div>
  );
});
