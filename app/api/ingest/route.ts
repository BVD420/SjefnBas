import { NextResponse } from "next/server";
import { ensureIngested, runIngest } from "@/lib/ingest";

export async function POST() {
  try {
    const result = await runIngest();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ingest failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const chunks = await ensureIngested();
    return NextResponse.json({ chunks });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Count failed" },
      { status: 500 }
    );
  }
}
