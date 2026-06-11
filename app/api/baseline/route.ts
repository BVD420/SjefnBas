import OpenAI from "openai";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    const { question } = (await request.json()) as { question?: string };

    if (!question?.trim()) {
      return new Response("Question is required", { status: 400 });
    }

    const stream = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful airline customer support assistant for Erasmus Airways. Answer from your general knowledge about airlines and EU passenger rights.",
        },
        { role: "user", content: question.trim() },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
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
    console.error("Baseline error:", error);
    return new Response(
      error instanceof Error ? error.message : "Baseline failed",
      { status: 500 }
    );
  }
}
