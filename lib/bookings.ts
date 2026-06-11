import { sql } from "@/lib/db";

export type Booking = {
  id: number;
  booking_ref: string;
  last_name: string;
  passenger_name: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_date: string;
  status: string;
  delay_hours: number | null;
  context_notes: string | null;
};

export async function findBooking(
  bookingRef: string,
  lastName: string
): Promise<Booking | null> {
  const normalizedRef = bookingRef.trim().toUpperCase();
  const normalizedName = lastName.trim().toLowerCase();

  const rows = await sql<Booking[]>`
    SELECT id, booking_ref, last_name, passenger_name, flight_number,
           origin, destination, departure_date::text, status,
           delay_hours, context_notes
    FROM bookings
    WHERE UPPER(booking_ref) = ${normalizedRef}
      AND LOWER(last_name) = ${normalizedName}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getBookingByRef(
  bookingRef: string
): Promise<Booking | null> {
  const rows = await sql<Booking[]>`
    SELECT id, booking_ref, last_name, passenger_name, flight_number,
           origin, destination, departure_date::text, status,
           delay_hours, context_notes
    FROM bookings
    WHERE UPPER(booking_ref) = ${bookingRef.trim().toUpperCase()}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export function formatBookingContext(booking: Booking): string {
  const lines = [
    `Booking reference: ${booking.booking_ref}`,
    `Passenger: ${booking.passenger_name}`,
    `Flight: ${booking.flight_number} ${booking.origin} → ${booking.destination}`,
    `Departure date: ${booking.departure_date}`,
    `Status: ${booking.status}`,
  ];
  if (booking.delay_hours != null) {
    lines.push(`Reported delay: ${booking.delay_hours} hours`);
  }
  if (booking.context_notes) {
    lines.push(`Notes: ${booking.context_notes}`);
  }
  return lines.join("\n");
}
