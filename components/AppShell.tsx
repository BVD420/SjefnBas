"use client";

import { useState } from "react";
import { Chat } from "./Chat";
import { FlowDiagram } from "./FlowDiagram";

type Tab = "chat" | "flow";

export function AppShell() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <header className="border-b border-slate-200 bg-[#0a2540] text-white">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
            Erasmus Airways
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Customer Support</h1>
          <p className="mt-1 text-sm text-slate-300">
            Your questions, our policies — answers grounded in official documents.
          </p>

          <nav className="mt-4 flex gap-1 rounded-xl bg-white/10 p-1">
            <button
              type="button"
              onClick={() => setTab("chat")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === "chat"
                  ? "bg-white text-[#0a2540] shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Support Chat
            </button>
            <button
              type="button"
              onClick={() => setTab("flow")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === "flow"
                  ? "bg-white text-[#0a2540] shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              How It Works
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1">
        {tab === "chat" ? <Chat /> : <FlowDiagram />}
      </main>
    </div>
  );
}
