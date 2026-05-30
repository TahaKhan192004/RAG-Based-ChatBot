export const aiProviderPlan = {
  embeddings: "Gemini text-embedding-004",
  responses: "Groq llama-3.1-8b-instant",
};

export { generateEmbedding } from "./gemini";
export { generateGroqAnswer, streamGroqAnswer } from "./groq";
