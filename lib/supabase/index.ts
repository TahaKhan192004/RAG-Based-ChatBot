export const supabasePlan = {
  tables: ["documents", "conversations", "messages", "document_chunks"],
  purpose: "Persist chat logs, document metadata, and processing state.",
};

export { createBrowserSupabaseClient } from "./browser";
