"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type SourceRow = {
  source: string;
  doc_type: string;
  chunks: number;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<"policy" | "live">("policy");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSources() {
    const res = await fetch("/api/admin/upload");
    if (res.ok) {
      const data = await res.json();
      setSources(data.sources ?? []);
      setAuthed(true);
    }
  }

  useEffect(() => {
    loadSources().catch(() => setAuthed(false));
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      return;
    }
    setAuthed(true);
    await loadSources();
  }

  async function handleUpload(e: FormEvent) {
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
            Upload policy documents and live notices to the knowledge base.
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
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-[var(--ea-primary-dark)] py-2.5 text-sm font-medium text-white"
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

        <form
          onSubmit={handleUpload}
          className="mt-8 rounded-2xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-6"
        >
          <h2 className="font-medium text-[var(--ea-text)]">Upload document</h2>
          <p className="mt-1 text-sm text-[var(--ea-text-muted)]">
            Accepts .txt and .pdf files. Re-uploading the same filename replaces
            its chunks.
          </p>

          <input
            type="file"
            accept=".txt,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-4 block w-full text-sm text-[var(--ea-text-muted)]"
          />

          <label className="mt-4 block text-sm text-[var(--ea-text)]">
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

          <button
            type="submit"
            disabled={!file || uploading}
            className="mt-4 rounded-xl bg-[var(--ea-primary)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload & embed"}
          </button>

          {message && (
            <p className="mt-3 text-sm text-[var(--ea-text-muted)]">{message}</p>
          )}
        </form>

        <div className="mt-8 rounded-2xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-6">
          <h2 className="font-medium text-[var(--ea-text)]">
            Indexed sources ({sources.reduce((n, s) => n + s.chunks, 0)} chunks)
          </h2>
          <ul className="mt-4 space-y-2">
            {sources.map((s) => (
              <li
                key={s.source}
                className="flex justify-between rounded-lg bg-[var(--ea-surface)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--ea-text)]">{s.source}</span>
                <span className="text-[var(--ea-text-muted)]">
                  {s.doc_type} · {s.chunks} chunks
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
