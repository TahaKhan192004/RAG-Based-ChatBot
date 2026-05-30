import "server-only";
import type { RecordMetadata } from "@pinecone-database/pinecone";
import { getPineconeIndex } from "@/lib/pinecone/client";
import type { SourceType } from "@/types";

export type RetrievedChunk = {
  text: string;
  title: string;
  documentId: string;
  sourceType: SourceType | "unknown";
  fileName: string | null;
  chunkIndex: number;
  score: number | null;
};

type ChunkMetadata = RecordMetadata & {
  text?: string;
  title?: string;
  documentId?: string;
  sourceType?: SourceType;
  fileName?: string;
  chunkIndex?: number;
};

export async function retrieveRelevantChunks({
  embedding,
  topK = 5,
}: {
  embedding: number[];
  topK?: number;
}): Promise<RetrievedChunk[]> {
  if (!embedding.length) {
    throw new Error("Cannot retrieve chunks with an empty embedding.");
  }

  const index = getPineconeIndex();
  const result = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    includeValues: false,
  });

  return result.matches
    .map((match) => {
      const metadata = match.metadata as ChunkMetadata | undefined;
      const text = typeof metadata?.text === "string" ? metadata.text.trim() : "";

      if (!text) {
        return null;
      }

      return {
        text,
        title:
          typeof metadata?.title === "string"
            ? metadata.title
            : "Untitled document",
        documentId:
          typeof metadata?.documentId === "string" ? metadata.documentId : "",
        sourceType: metadata?.sourceType ?? "unknown",
        fileName:
          typeof metadata?.fileName === "string" && metadata.fileName
            ? metadata.fileName
            : null,
        chunkIndex:
          typeof metadata?.chunkIndex === "number" ? metadata.chunkIndex : 0,
        score: typeof match.score === "number" ? match.score : null,
      };
    })
    .filter((chunk): chunk is RetrievedChunk => chunk !== null)
    .slice(0, 5);
}
