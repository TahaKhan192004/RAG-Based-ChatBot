import "server-only";
import { generateEmbedding } from "@/lib/ai/gemini";
import { getPineconeIndex } from "@/lib/pinecone/client";
import { cleanText, chunkText } from "@/lib/rag/chunk";
import { requireSupabaseServiceClient } from "@/lib/supabase/server";
import type { SourceType } from "@/types";

type IngestDocumentInput = {
  documentId: string;
  title: string;
  sourceType: SourceType;
  fileName?: string | null;
  text: string;
};

type PineconeMetadata = {
  documentId: string;
  title: string;
  sourceType: SourceType;
  fileName: string;
  chunkIndex: number;
  text: string;
};

const UPSERT_BATCH_SIZE = 50;

function getPineconeId(documentId: string, chunkIndex: number) {
  return `doc_${documentId}chunk${chunkIndex}`;
}

async function markDocumentProcessing(input: IngestDocumentInput) {
  const supabase = requireSupabaseServiceClient();

  const { error } = await supabase.from("documents").upsert({
    id: input.documentId,
    title: input.title,
    source_type: input.sourceType,
    file_name: input.fileName ?? null,
    status: "processing",
    chunk_count: 0,
    error_message: null,
  });

  if (error) {
    throw new Error(`Failed to mark document processing: ${error.message}`);
  }
}

async function markDocumentCompleted(documentId: string, chunkCount: number) {
  const supabase = requireSupabaseServiceClient();

  const { error } = await supabase
    .from("documents")
    .update({
      status: "completed",
      chunk_count: chunkCount,
      error_message: null,
    })
    .eq("id", documentId);

  if (error) {
    throw new Error(`Failed to mark document completed: ${error.message}`);
  }
}

async function markDocumentFailed(documentId: string, errorMessage: string) {
  const supabase = requireSupabaseServiceClient();

  const { error } = await supabase
    .from("documents")
    .update({
      status: "failed",
      error_message: errorMessage,
    })
    .eq("id", documentId);

  if (error) {
    throw new Error(`Failed to mark document failed: ${error.message}`);
  }
}

async function upsertInBatches(
  vectors: Array<{
    id: string;
    values: number[];
    metadata: PineconeMetadata;
  }>,
) {
  const index = getPineconeIndex();

  for (let start = 0; start < vectors.length; start += UPSERT_BATCH_SIZE) {
    const batch = vectors.slice(start, start + UPSERT_BATCH_SIZE);
    await index.upsert({ records: batch });
  }
}

export async function ingestDocument(input: IngestDocumentInput) {
  await markDocumentProcessing(input);

  try {
    const cleaned = cleanText(input.text);
    const chunks = chunkText(cleaned);

    if (chunks.length === 0) {
      throw new Error("Document did not produce any chunks after cleaning.");
    }

    const vectors = [];

    for (const [chunkIndex, chunk] of chunks.entries()) {
      const values = await generateEmbedding(chunk);
      const id = getPineconeId(input.documentId, chunkIndex);

      vectors.push({
        id,
        values,
        metadata: {
          documentId: input.documentId,
          title: input.title,
          sourceType: input.sourceType,
          fileName: input.fileName ?? "",
          chunkIndex,
          text: chunk,
        },
      });
    }

    await upsertInBatches(vectors);
    await markDocumentCompleted(input.documentId, chunks.length);

    return {
      documentId: input.documentId,
      chunkCount: chunks.length,
      pineconeIds: vectors.map((vector) => vector.id),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown ingestion error.";
    await markDocumentFailed(input.documentId, message);
    throw error;
  }
}
