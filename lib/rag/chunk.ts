export type ChunkTextOptions = {
  chunkSize?: number;
  overlap?: number;
};

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 150;
const MIN_CHUNK_LENGTH = 80;

export function cleanText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .trim();
}

export function chunkText(text: string, options: ChunkTextOptions = {}) {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;
  const cleaned = cleanText(text);

  if (!cleaned) {
    return [];
  }

  if (chunkSize <= MIN_CHUNK_LENGTH) {
    throw new Error("chunkSize must be greater than 80 characters.");
  }

  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error("overlap must be non-negative and smaller than chunkSize.");
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    const targetEnd = Math.min(start + chunkSize, cleaned.length);
    let end = targetEnd;

    if (targetEnd < cleaned.length) {
      const paragraphBreak = cleaned.lastIndexOf("\n\n", targetEnd);
      const sentenceBreak = cleaned.lastIndexOf(". ", targetEnd);
      const wordBreak = cleaned.lastIndexOf(" ", targetEnd);
      const minimumEnd = start + Math.floor(chunkSize * 0.6);

      if (paragraphBreak > minimumEnd) {
        end = paragraphBreak;
      } else if (sentenceBreak > minimumEnd) {
        end = sentenceBreak + 1;
      } else if (wordBreak > minimumEnd) {
        end = wordBreak;
      }
    }

    const chunk = cleaned.slice(start, end).trim();

    if (chunk.length >= MIN_CHUNK_LENGTH) {
      chunks.push(chunk);
    }

    if (end >= cleaned.length) {
      break;
    }

    start = Math.max(0, end - overlap);
  }

  return chunks;
}
