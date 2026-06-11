"use client";

import Link from "next/link";
import { useBooking } from "./BookingProvider";

const statusLabels: Record<string, string> = {
  on_time: "On time",
  delayed: "Delayed",
  cancelled: "Cancelled",
  rebooked: "Rebooked",
  at_risk: "Disruption risk",
};

export function TripBanner() {
  const { booking, logout } = useBooking();

  if (!booking) return null;

  return (
    <div className="border-b border-[var(--ea-border)] bg-[color-mix(in_srgb,var(--ea-primary)_8%,var(--ea-card))]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-semibold text-[var(--ea-text)]">
            {booking.passenger_name}
          </span>
          <span className="text-[var(--ea-text-muted)]">
            {booking.booking_ref} · {booking.flight_number}{" "}
            {booking.origin}→{booking.destination} · {booking.departure_date}
          </span>
          <span className="rounded-full bg-[var(--ea-primary)] px-2.5 py-0.5 text-xs font-medium text-white">
            {statusLabels[booking.status] ?? booking.status}
          </span>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="text-xs font-medium text-[var(--ea-primary-dark)] underline-offset-2 hover:underline dark:text-[var(--ea-primary)]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export function BookingLoginLink() {
  const { booking } = useBooking();
  if (booking) return null;

  return (
    <Link
      href="/login"
      className="rounded-lg border border-[var(--ea-border)] px-3 py-1.5 text-sm font-medium text-[var(--ea-text)] transition hover:border-[var(--ea-primary)]"
    >
      My booking
    </Link>
  );
}
