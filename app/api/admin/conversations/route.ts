import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { ConversationSummary } from "@/types";

export async function GET() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service client is not configured." },
      { status: 500 },
    );
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  if (conversationsError) {
    return NextResponse.json(
      { error: conversationsError.message },
      { status: 500 },
    );
  }

  const conversationIds = conversations.map((conversation) => conversation.id);

  if (conversationIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  const summaries: ConversationSummary[] = conversations.map((conversation) => {
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

  return NextResponse.json({ conversations: summaries });
}
