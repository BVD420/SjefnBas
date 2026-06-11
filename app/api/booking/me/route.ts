import { NextResponse } from "next/server";
import { getBookingRef } from "@/lib/auth";
import { getBookingByRef } from "@/lib/bookings";

export async function GET() {
  try {
    const ref = await getBookingRef();
    if (!ref) {
      return NextResponse.json({ booking: null });
    }

    const booking = await getBookingByRef(ref);
    if (!booking) {
      return NextResponse.json({ booking: null });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
