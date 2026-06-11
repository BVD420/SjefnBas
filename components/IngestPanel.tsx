"use client";

import { useEffect, useState } from "react";

type IngestPanelProps = {
  onLoaded?: (count: number) => void;
};

export function IngestPanel({ onLoaded }: IngestPanelProps) {
  const [open, setOpen] = useState(false);
  const [chunkCount, setChunkCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ingest")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.chunks === "number") {
          setChunkCount(data.chunks);
          if (data.chunks > 0) onLoaded?.(data.chunks);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLoad() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load documents");
      }

      setChunkCount(data.chunks);
      onLoaded?.(data.chunks);
      setMessage(`Loaded ${data.chunks} chunks from ${data.documents} documents.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load documents"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <span>Knowledge base</span>
        <span className="text-slate-500">
          {chunkCount !== null ? `${chunkCount} chunks` : "Not loaded"}
          <span className="ml-2">{open ? "▲" : "▼"}</span>
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-100 px-4 py-4">
          <p className="text-sm text-slate-600">
            Load all 12 Erasmus Airways policy documents and live notices into
            Supabase for retrieval.
          </p>
          <button
            type="button"
            onClick={handleLoad}
            disabled={loading}
            className="rounded-lg bg-[#0a2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a4d8f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load airline knowledge"}
          </button>
          {message && (
            <p
              className={`text-sm ${
                message.startsWith("Loaded")
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
