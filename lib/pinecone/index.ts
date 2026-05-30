export const pineconePlan = {
  indexEnv: "PINECONE_INDEX_NAME",
  purpose: "Store and query embedded document chunks with metadata.",
};

export { getPineconeClient, getPineconeIndex } from "./client";
