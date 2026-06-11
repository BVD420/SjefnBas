"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/components/BookingProvider";

const DEMO_HINTS = [
  { ref: "EA-7K2M9", name: "Jansen" },
  { ref: "EA-3R8P1", name: "de Vries" },
  { ref: "EA-9M4K2", name: "Bakker" },
];

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useBooking();
  const [bookingRef, setBookingRef] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/booking/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingRef, lastName }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      await refresh();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(ref: string, name: string) {
    setBookingRef(ref);
    setLastName(name);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ea-surface)]">
      <div
        className="px-6 py-12 text-white"
        style={{
          background: `linear-gradient(135deg, var(--ea-hero-from) 0%, var(--ea-hero-to) 100%)`,
        }}
      >
        <div className="mx-auto max-w-md">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            ← Back to help centre
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Find your booking</h1>
          <p className="mt-2 text-sm text-white/80">
            Enter your booking reference and last name to get personalised help.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--ea-border)] bg-[var(--ea-card)] p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-[var(--ea-text)]">
            Booking reference
            <input
              type="text"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="EA-7K2M9"
              className="mt-1 w-full rounded-xl border border-[var(--ea-border)] bg-[var(--ea-surface)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ea-primary)]"
              required
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-[var(--ea-text)]">
            Last name
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Jansen"
              className="mt-1 w-full rounded-xl border border-[var(--ea-border)] bg-[var(--ea-surface)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ea-primary)]"
              required
            />
          </label>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[var(--ea-primary)] py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Looking up..." : "Continue"}
          </button>
        </form>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ea-text-muted)]">
            Demo bookings
          </p>
          <div className="mt-3 space-y-2">
            {DEMO_HINTS.map((d) => (
              <button
                key={d.ref}
                type="button"
                onClick={() => fillDemo(d.ref, d.name)}
                className="block w-full rounded-xl border border-[var(--ea-border)] bg-[var(--ea-card)] px-4 py-3 text-left text-sm transition hover:border-[var(--ea-primary)]"
              >
                <span className="font-medium text-[var(--ea-text)]">{d.ref}</span>
                <span className="text-[var(--ea-text-muted)]"> · {d.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
