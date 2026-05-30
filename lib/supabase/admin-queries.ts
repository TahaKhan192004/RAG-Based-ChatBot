import "server-only";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { ConversationSummary, Document } from "@/types";

export async function listDocuments(): Promise<Document[]> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listConversationSummaries(): Promise<
  ConversationSummary[]
> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [];
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (conversationsError) {
    throw new Error(conversationsError.message);
  }

  const conversationIds = conversations.map((conversation) => conversation.id);

  if (conversationIds.length === 0) {
    return [];
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  return conversations.map((conversation) => {
    const conversationMessages = messages.filter(
      (message) => message.conversation_id === conversation.id,
    );
    const latest = conversationMessages[0];

    return {
      ...conversation,
      message_count: conversationMessages.length,
      latest_message: latest?.content ?? null,
      latest_message_at: latest?.created_at ?? null,
    };
  });
}
