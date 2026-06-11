export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string
): Promise<{ text: string; source: string }> {
  const baseName = filename.replace(/\.[^.]+$/, "");
  const source = baseName.toLowerCase().replace(/\s+/g, "_");
  const lower = filename.toLowerCase();

  if (lower.endsWith(".txt")) {
    return { text: buffer.toString("utf-8"), source: `upload_${source}` };
  }

  if (lower.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return { text: result.text, source: `upload_${source}` };
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("Only .txt and .pdf files are supported");
}
