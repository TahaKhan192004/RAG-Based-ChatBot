import "server-only";

const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_EMBEDDING_DIMENSIONS = 768;

type GeminiEmbeddingResponse = {
  embedding?: {
    values?: number[];
  };
  error?: {
    message?: string;
  };
};

function getEmbeddingDimensions() {
  const raw = process.env.GEMINI_EMBEDDING_DIMENSIONS;

  if (!raw) {
    return DEFAULT_EMBEDDING_DIMENSIONS;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("GEMINI_EMBEDDING_DIMENSIONS must be a positive integer.");
  }

  return parsed;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = text.trim();

  if (!input) {
    throw new Error("Cannot generate an embedding for empty text.");
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const modelName =
    process.env.GEMINI_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: `models/${modelName}`,
      content: {
        parts: [{ text: input }],
      },
      outputDimensionality: getEmbeddingDimensions(),
    }),
  });

  const body = (await response.json().catch(() => null)) as
    | GeminiEmbeddingResponse
    | null;

  if (!response.ok) {
    throw new Error(
      body?.error?.message ??
        `Gemini embedding request failed with ${response.status}.`,
    );
  }

  const embedding = body?.embedding?.values;

  if (!embedding?.length) {
    throw new Error("Gemini returned an empty embedding.");
  }

  return embedding;
}
