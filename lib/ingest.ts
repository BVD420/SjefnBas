import { chunkText } from "@/lib/chunk";
import { sql } from "@/lib/db";
import { loadAirlineDocuments } from "@/lib/documents";
import { embedTexts } from "@/lib/voyage";

const BATCH_SIZE = 32;

export async function runIngest(): Promise<{
  chunks: number;
  documents: number;
}> {
  const documents = loadAirlineDocuments();
  const prepared = documents.flatMap((doc) =>
    chunkText(doc.text).map((content) => ({
      source: doc.source,
      content,
      doc_type: doc.category,
    }))
  );

  if (prepared.length === 0) {
    throw new Error("No documents found");
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
      const { source, content, doc_type } = batch[j];
      const embedding = embeddings[j];
      await sql`
        INSERT INTO chunks (source, content, embedding, doc_type)
        VALUES (${source}, ${content}, ${JSON.stringify(embedding)}::vector, ${doc_type})
      `;
      inserted++;
    }
  }

  return { chunks: inserted, documents: documents.length };
}

export async function getChunkCount(): Promise<number> {
  const [result] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM chunks
  `;
  return Number(result.count);
}

export async function ensureIngested(): Promise<number> {
  const count = await getChunkCount();
  if (count > 0) return count;
  const result = await runIngest();
  return result.chunks;
}
