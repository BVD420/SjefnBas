import { cookies } from "next/headers";

export const BOOKING_COOKIE = "ea_booking_ref";
export const ADMIN_COOKIE = "ea_admin_session";

export async function getBookingRef(): Promise<string | null> {
  const store = await cookies();
  return store.get(BOOKING_COOKIE)?.value ?? null;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "authenticated";
}
