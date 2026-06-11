import OpenAI from "openai";
import { getBookingRef } from "@/lib/auth";
import { formatBookingContext, getBookingByRef } from "@/lib/bookings";
import { sql } from "@/lib/db";
import type { SourceRef } from "@/lib/types";
import { embedQuery } from "@/lib/voyage";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

type RetrievedChunk = {
  source: string;
  content: string;
  doc_type: "policy" | "live";
};

function buildSystemPrompt(
  chunks: RetrievedChunk[],
  passengerContext?: string
): string {
  const context = chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}: ${chunk.source} (${chunk.doc_type === "live" ? "LIVE NOTICE" : "POLICY"})]\n${chunk.content}`
    )
    .join("\n\n---\n\n");

  return `You are a customer support assistant for Erasmus Airways.

Answer the passenger's question using ONLY the context below. Do not use outside knowledge.

Rules:
- If the context does not contain enough information, say clearly that you do not know and suggest contacting Erasmus Airways support.
- If a live notice conflicts with a stable policy document, follow the live notice.
- Be concise, accurate, and helpful.
- Mention relevant policy details such as time limits, fees, and eligibility when they appear in the context.
- Do not invent bereavement policies, refund rules, or compensation amounts that are not in the context.
${passengerContext ? `\nPassenger booking details (use to personalize, but policy answers must still come from context):\n${passengerContext}\n` : ""}
Context:
${context}`;
}

function uniqueSources(chunks: RetrievedChunk[]): SourceRef[] {
  const seen = new Set<string>();
  const sources: SourceRef[] = [];
  for (const chunk of chunks) {
    if (seen.has(chunk.source)) continue;
    seen.add(chunk.source);
    sources.push({ name: chunk.source, doc_type: chunk.doc_type });
  }
  return sources;
}

export async function POST(request: Request) {
  try {
    const { question } = (await request.json()) as { question?: string };

    if (!question?.trim()) {
      return new Response("Question is required", { status: 400 });
    }

    const queryEmbedding = await embedQuery(question.trim());

    const chunks = await sql<RetrievedChunk[]>`
      SELECT source, content, doc_type
      FROM chunks
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT 4
    `;

    if (chunks.length === 0) {
      return new Response(
        "No knowledge loaded yet. Please try again in a moment.",
        { status: 400 }
      );
    }

    const sources = uniqueSources(chunks);

    let passengerContext: string | undefined;
    const bookingRef = await getBookingRef();
    if (bookingRef) {
      const booking = await getBookingByRef(bookingRef);
      if (booking) passengerContext = formatBookingContext(booking);
    }

    const system = buildSystemPrompt(chunks, passengerContext);

    const stream = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: question.trim() },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "sources", sources })}\n\n`
          )
        );

        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Streaming failed";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      error instanceof Error ? error.message : "Chat failed",
      { status: 500 }
    );
  }
}
