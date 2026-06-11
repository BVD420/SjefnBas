"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { IngestPanel } from "./IngestPanel";
import { MessageBubble } from "./MessageBubble";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

const EXAMPLE_QUESTIONS = [
  "My flight was delayed 2.5 hours — am I entitled to compensation?",
  "My Tel Aviv flight was rerouted due to airspace restrictions and arrived 3.5 hours late — do I get EU261 compensation?",
  "Erasmus Airways cancelled my flight 10 days before departure — what are my options?",
  "What is Erasmus Airways' policy on bereavement cancellations?",
];

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [knowledgeReady, setKnowledgeReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function sendMessage(question: string) {
    const trimmed = question.trim();
    if (!trimmed || streaming) return;

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
        const text = await res.text();
        throw new Error(text || "Chat request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sources: string[] = [];
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
            sources?: string[];
            text?: string;
            message?: string;
          };

          if (data.type === "sources" && data.sources) {
            sources = data.sources;
          } else if (data.type === "text" && data.text) {
            content += data.text;
          } else if (data.type === "error" && data.message) {
            content += `\n\nError: ${data.message}`;
          }

          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content, sources }
                : message
            )
          );
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content:
                  error instanceof Error
                    ? error.message
                    : "Something went wrong.",
              }
            : message
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-1 flex-col">
      <IngestPanel onLoaded={(count) => setKnowledgeReady(count > 0)} />

      <div className="flex flex-1 flex-col px-4 py-6">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="text-sm text-slate-600">
                {knowledgeReady
                  ? "Ask a question about baggage, delays, refunds, or travel notices."
                  : "Load the airline knowledge base first, then try one of these questions:"}
              </p>
              <div className="mt-4 space-y-2">
                {EXAMPLE_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    disabled={streaming || !knowledgeReady}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-[#1a4d8f] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
                  isStreaming={
                    streaming &&
                    message.role === "assistant" &&
                    message === messages[messages.length - 1]
                  }
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-4"
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              knowledgeReady
                ? "Ask about your flight, baggage, or refund..."
                : "Load knowledge base to start chatting..."
            }
            disabled={streaming || !knowledgeReady}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-[#1a4d8f] focus:ring-2 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={streaming || !knowledgeReady || !input.trim()}
            className="rounded-xl bg-[#1a4d8f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0a2540] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
