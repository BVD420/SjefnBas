import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { runIngest } = await import("../lib/ingest");
  const result = await runIngest();
  console.log("Re-ingested:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
