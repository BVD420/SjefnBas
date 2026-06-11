import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { extractTextFromBuffer } from "@/lib/extract-text";
import { ingestDocument, listSources } from "@/lib/ingest";
import type { DocType } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await listSources();
  return NextResponse.json({ sources });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const docType = (form.get("docType") as DocType) || "policy";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { text, source } = await extractTextFromBuffer(buffer, file.name);
    if (!text.trim()) {
      return NextResponse.json({ error: "File contains no text" }, { status: 400 });
    }

    const chunks = await ingestDocument(source, text, docType, true);

    return NextResponse.json({ source, chunks, doc_type: docType });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
