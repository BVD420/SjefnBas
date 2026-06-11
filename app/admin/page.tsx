"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type SourceRow = {
  source: string;
  doc_type: string;
  chunks: number;
};

type Tab = "paste" | "file";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [tab, setTab] = useState<Tab>("paste");
  const [file, setFile] = useState<File | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [docType, setDocType] = useState<"policy" | "live">("live");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadSources() {
    const res = await fetch("/api/admin/upload");
    if (res.ok) {
      const data = await res.json();
      setSources(data.sources ?? []);
      setAuthed(true);
      return true;
    }
    setAuthed(false);
    return false;
  }

  useEffect(() => {
    loadSources().finally(() => setChecking(false));
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    setAuthed(true);
    await loadSources();
  }

  async function handlePasteSubmit(e: FormEvent) {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: sourceName,
          text: pasteText,
          docType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMessage(`Added "${data.source}" — ${data.chunks} chunks embedded.`);
      setPasteText("");
      setSourceName("");
      await loadSources();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage("");

    const form = new FormData();
    form.append("file", file);
    form.append("docType", docType);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMessage(`Uploaded ${data.source}: ${data.chunks} chunks added.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadSources();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setSources([]);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--ea-text-muted)]">
        Loading...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ea-surface)] px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-6 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-[var(--ea-text)]">
            Admin login
          </h1>
          <p className="mt-1 text-sm text-[var(--ea-text-muted)]">
            Sign in to add documents to the knowledge base.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="mt-4 w-full rounded-xl border border-[var(--ea-border)] bg-[var(--ea-surface)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ea-primary)]"
            required
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {!error && (
            <p className="mt-2 text-xs text-[var(--ea-text-muted)]">
              Set <code className="rounded bg-[var(--ea-surface)] px-1">ADMIN_PASSWORD</code> in
              Vercel env vars if login fails.
            </p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-[var(--ea-primary)] py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Sign in
          </button>
          <Link
            href="/"
            className="mt-4 block text-center text-sm text-[var(--ea-text-muted)] hover:text-[var(--ea-primary)]"
          >
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ea-surface)] px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[var(--ea-text)]">
            Knowledge base admin
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-[var(--ea-text-muted)] hover:text-[var(--ea-primary)]"
          >
            Sign out
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-6">
          <div className="flex gap-2 rounded-lg bg-[var(--ea-surface)] p-1">
            <button
              type="button"
              onClick={() => setTab("paste")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                tab === "paste"
                  ? "bg-[var(--ea-card)] text-[var(--ea-text)] shadow-sm"
                  : "text-[var(--ea-text-muted)]"
              }`}
            >
              Paste text
            </button>
            <button
              type="button"
              onClick={() => setTab("file")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                tab === "file"
                  ? "bg-[var(--ea-card)] text-[var(--ea-text)] shadow-sm"
                  : "text-[var(--ea-text-muted)]"
              }`}
            >
              Upload file
            </button>
          </div>

          <label className="mt-5 block text-sm font-medium text-[var(--ea-text)]">
            Document type
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as "policy" | "live")}
              className="mt-1 w-full rounded-xl border border-[var(--ea-border)] bg-[var(--ea-surface)] px-4 py-2.5 text-sm"
            >
              <option value="policy">Policy</option>
              <option value="live">Live notice</option>
            </select>
          </label>

          {tab === "paste" ? (
            <form onSubmit={handlePasteSubmit} className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-[var(--ea-text)]">
                Source name
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="13_heathrow_slot_delay"
                  className="mt-1 w-full rounded-xl border border-[var(--ea-border)] bg-[var(--ea-surface)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ea-primary)]"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-[var(--ea-text)]">
                Document text
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={12}
                  placeholder="Paste your live notice or policy text here..."
                  className="mt-1 w-full rounded-xl border border-[var(--ea-border)] bg-[var(--ea-surface)] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ea-primary)]"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={uploading || !sourceName.trim() || !pasteText.trim()}
                className="w-full rounded-xl bg-[var(--ea-primary)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {uploading ? "Embedding..." : "Add to knowledge base"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleFileSubmit} className="mt-4 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--ea-primary)] bg-[color-mix(in_srgb,var(--ea-primary)_6%,transparent)] px-6 py-10 text-center transition hover:bg-[color-mix(in_srgb,var(--ea-primary)_12%,transparent)]"
              >
                <span className="text-lg font-semibold text-[var(--ea-primary)]">
                  Choose .txt or .pdf file
                </span>
                <span className="mt-1 text-sm text-[var(--ea-text-muted)]">
                  Click here to browse
                </span>
              </button>
              {file && (
                <p className="text-center text-sm text-[var(--ea-text)]">
                  Selected: <strong>{file.name}</strong>
                </p>
              )}
              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full rounded-xl bg-[var(--ea-primary)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {uploading ? "Uploading..." : "Upload & embed"}
              </button>
            </form>
          )}

          {message && (
            <p
              className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                message.includes("chunks")
                  ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-6">
          <h2 className="font-medium text-[var(--ea-text)]">
            Indexed sources ({sources.reduce((n, s) => n + s.chunks, 0)} chunks)
          </h2>
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {sources.map((s) => (
              <li
                key={s.source}
                className="flex justify-between rounded-lg bg-[var(--ea-surface)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--ea-text)]">{s.source}</span>
                <span className="text-[var(--ea-text-muted)]">
                  {s.doc_type} · {s.chunks}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="mt-6 inline-block text-sm text-[var(--ea-primary)]"
        >
          ← Back to help centre
        </Link>
      </div>
    </div>
  );
}
