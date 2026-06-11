import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export type AirlineDocument = {
  source: string;
  text: string;
  category: "policy" | "live";
};

const POLICY_DIR = join(process.cwd(), "policy files");
const LIVE_DIR = join(process.cwd(), "live files");

function readDocumentsFromDir(
  dir: string,
  category: "policy" | "live"
): AirlineDocument[] {
  const files = readdirSync(dir)
    .filter((file) => file.endsWith(".txt"))
    .sort();

  return files.map((file) => {
    const text = readFileSync(join(dir, file), "utf-8");
    const source = file.replace(/\.txt$/, "");
    return { source, text, category };
  });
}

export function loadAirlineDocuments(): AirlineDocument[] {
  return [
    ...readDocumentsFromDir(POLICY_DIR, "policy"),
    ...readDocumentsFromDir(LIVE_DIR, "live"),
  ];
}
