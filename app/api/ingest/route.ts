import { NextResponse } from "next/server";
import { chunkText } from "@/lib/chunk";
import { sql } from "@/lib/db";
import { loadAirlineDocuments } from "@/lib/documents";
import { embedTexts } from "@/lib/voyage";

const BATCH_SIZE = 32;

export async function POST() {
  try {
    const documents = loadAirlineDocuments();
    const prepared = documents.flatMap((doc) =>
      chunkText(doc.text).map((content) => ({
        source: doc.source,
        content,
      }))
    );

    if (prepared.length === 0) {
      return NextResponse.json({ error: "No documents found" }, { status: 400 });
    }

    await sql`DELETE FROM chunks`;

    let inserted = 0;

    for (let i = 0; i < prepared.length; i += BATCH_SIZE) {
      const batch = prepared.slice(i, i + BATCH_SIZE);
      const embeddings = await embedTexts(
        batch.map((item) => item.content),
        "document"
      );

      for (let j = 0; j < batch.length; j++) {
        const { source, content } = batch[j];
        const embedding = embeddings[j];
        await sql`
          INSERT INTO chunks (source, content, embedding)
          VALUES (${source}, ${content}, ${JSON.stringify(embedding)}::vector)
        `;
        inserted++;
      }
    }

    return NextResponse.json({
      chunks: inserted,
      documents: documents.length,
    });
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
    const [result] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM chunks
    `;
    return NextResponse.json({ chunks: Number(result.count) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Count failed" },
      { status: 500 }
    );
  }
}
