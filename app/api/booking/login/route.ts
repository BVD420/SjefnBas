import { NextResponse } from "next/server";
import { BOOKING_COOKIE } from "@/lib/auth";
import { findBooking } from "@/lib/bookings";

export async function POST(request: Request) {
  try {
    const { bookingRef, lastName } = (await request.json()) as {
      bookingRef?: string;
      lastName?: string;
    };

    if (!bookingRef?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: "Booking reference and last name are required" },
        { status: 400 }
      );
    }

    const booking = await findBooking(bookingRef, lastName);
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found. Check your reference and last name." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ booking });
    response.cookies.set(BOOKING_COOKIE, booking.booking_ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    );
  }
}
