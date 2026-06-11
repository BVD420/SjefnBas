/**
 * End-to-end RAG validation for the 4 buildathon demo questions.
 * Requires .env.local with OPENAI_API_KEY, VOYAGE_API_KEY, DATABASE_URL.
 *
 * Usage: npx tsx scripts/test-rag.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

const DEMO_QUESTIONS = [
  {
    question:
      "My flight was delayed 2.5 hours — am I entitled to compensation?",
    expectIncludes: ["3 hour", "not entitled", "no compensation", "don't"],
  },
  {
    question:
      "My Tel Aviv flight was rerouted due to airspace restrictions and arrived 3.5 hours late — do I get EU261 compensation?",
    expectIncludes: ["not", "extraordinary", "no compensation", "won't receive"],
  },
  {
    question:
      "Erasmus Airways cancelled my flight 10 days before departure — what are my options?",
    expectIncludes: ["compensation", "refund", "re-rout"],
  },
  {
    question: "What is Erasmus Airways' policy on bereavement cancellations?",
    expectIncludes: ["don't know", "do not know", "not contain", "no information", "contact"],
  },
];

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/ingest`);
      if (res.ok) return;
    } catch {
      // server not ready
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server not reachable at ${BASE_URL}`);
}

async function ingest() {
  const res = await fetch(`${BASE_URL}/api/ingest`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Ingest failed");
  console.log(`Ingested ${data.chunks} chunks from ${data.documents} documents`);
}

async function ask(question: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok || !res.body) {
    throw new Error(await res.text());
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") continue;
      const data = JSON.parse(payload);
      if (data.type === "text") answer += data.text;
    }
  }

  return answer;
}

function checkExpectations(answer: string, expectIncludes: string[]) {
  const lower = answer.toLowerCase();
  return expectIncludes.some((phrase) => lower.includes(phrase.toLowerCase()));
}

async function main() {
  const required = ["OPENAI_API_KEY", "VOYAGE_API_KEY", "DATABASE_URL"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")}`);
    console.error("Copy .env.example to .env.local and fill in your keys.");
    process.exit(1);
  }

  await waitForServer();
  await ingest();

  let passed = 0;
  for (const [index, item] of DEMO_QUESTIONS.entries()) {
    console.log(`\n--- Question ${index + 1} ---`);
    console.log(item.question);
    const answer = await ask(item.question);
    console.log(`\nAnswer: ${answer.slice(0, 300)}${answer.length > 300 ? "..." : ""}`);

    const ok = checkExpectations(answer, item.expectIncludes);
    console.log(ok ? "PASS" : "CHECK MANUALLY");
    if (ok) passed++;
  }

  console.log(`\n${passed}/${DEMO_QUESTIONS.length} automated checks passed`);
  process.exit(passed === DEMO_QUESTIONS.length ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
