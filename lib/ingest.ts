import { chunkText } from "@/lib/chunk";
import { sql } from "@/lib/db";
import { loadAirlineDocuments } from "@/lib/documents";
import type { DocType } from "@/lib/types";
import { embedTexts } from "@/lib/voyage";

const BATCH_SIZE = 32;

export type IngestItem = {
  source: string;
  content: string;
  doc_type: DocType;
};

export async function insertChunks(items: IngestItem[]): Promise<number> {
  let inserted = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const embeddings = await embedTexts(
      batch.map((item) => item.content),
      "document"
    );

    for (let j = 0; j < batch.length; j++) {
      const { source, content, doc_type } = batch[j];
      const embedding = embeddings[j];
      await sql`
        INSERT INTO chunks (source, content, embedding, doc_type)
        VALUES (${source}, ${content}, ${JSON.stringify(embedding)}::vector, ${doc_type})
      `;
      inserted++;
    }
  }

  return inserted;
}

export async function ingestDocument(
  source: string,
  text: string,
  doc_type: DocType,
  replace = false
): Promise<number> {
  if (replace) {
    await sql`DELETE FROM chunks WHERE source = ${source}`;
  }

  const prepared = chunkText(text).map((content) => ({
    source,
    content,
    doc_type,
  }));

  if (prepared.length === 0) return 0;
  return insertChunks(prepared);
}

export async function runIngest(): Promise<{
  chunks: number;
  documents: number;
}> {
  const documents = loadAirlineDocuments();
  const prepared = documents.flatMap((doc) =>
    chunkText(doc.text).map((content) => ({
      source: doc.source,
      content,
      doc_type: doc.category as DocType,
    }))
  );

  if (prepared.length === 0) {
    throw new Error("No documents found");
  }

  await sql`DELETE FROM chunks`;
  const chunks = await insertChunks(prepared);

  return { chunks, documents: documents.length };
}

export async function getChunkCount(): Promise<number> {
  const [result] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM chunks
  `;
  return Number(result.count);
}

export async function listSources(): Promise<
  { source: string; doc_type: string; chunks: number }[]
> {
  return sql`
    SELECT source, doc_type, COUNT(*)::int AS chunks
    FROM chunks
    GROUP BY source, doc_type
    ORDER BY source
  `;
}

export async function ensureIngested(): Promise<number> {
  const count = await getChunkCount();
  if (count > 0) return count;
  const result = await runIngest();
  return result.chunks;
}
