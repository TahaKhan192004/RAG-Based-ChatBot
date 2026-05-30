import "server-only";
import type { RetrievedChunk } from "@/lib/rag/retrieve";

export function buildGroundedPrompt({
  question,
  chunks,
}: {
  question: string;
  chunks: RetrievedChunk[];
}) {
  const context = chunks
    .map(
      (chunk, index) => `Source ${index + 1}
Title: ${chunk.title}
Document ID: ${chunk.documentId}
Chunk: ${chunk.chunkIndex}
Content:
${chunk.text}`,
    )
    .join("\n\n---\n\n");

  return `You are the AI Savvy website assistant.
Answer only using the provided knowledge context.
If answer is not available in context, say you do not have that information and suggest contacting the team.
Do not invent pricing, dates, guarantees, or policies.
Keep answers concise, warm, operator-direct.

Knowledge context:
${context}

User question:
${question}

Answer:`;
}

export function getNoKnowledgeBaseAnswer() {
  return "I do not have any knowledge base content available yet. Please contact the team so they can help with the right information.";
}
