"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Booking = {
  booking_ref: string;
  passenger_name: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_date: string;
  status: string;
  delay_hours: number | null;
  context_notes: string | null;
};

type BookingContextValue = {
  booking: Booking | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/booking/me");
      const data = await res.json();
      setBooking(data.booking ?? null);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function logout() {
    await fetch("/api/booking/logout", { method: "POST" });
    setBooking(null);
  }

  return (
    <BookingContext.Provider value={{ booking, loading, refresh, logout }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
