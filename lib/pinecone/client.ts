import "server-only";
import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

export function getPineconeClient() {
  const apiKey = process.env.PINECONE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing PINECONE_API_KEY.");
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey });
  }

  return pineconeClient;
}

export function getPineconeIndex() {
  const indexName = process.env.PINECONE_INDEX_NAME;

  if (!indexName) {
    throw new Error("Missing PINECONE_INDEX_NAME.");
  }

  return getPineconeClient().index(indexName);
}
