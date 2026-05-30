import "server-only";
import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer.length) {
    throw new Error("Cannot extract text from an empty PDF buffer.");
  }

  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  await parser.destroy();
  const text = parsed.text.trim();

  if (!text) {
    throw new Error("No extractable text found in PDF.");
  }

  return text;
}
