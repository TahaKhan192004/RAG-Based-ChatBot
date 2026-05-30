"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Conversation, ConversationSummary, Message } from "@/types";
import { cn } from "@/lib/utils";

type ConversationResponse = {
  conversation?: Conversation;
  messages?: Message[];
  error?: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ConversationsPanel({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadConversation(id: string) {
    setSelectedId(id);
    setLoadingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/conversations/${id}`);
      const body = (await response.json().catch(() => null)) as
        | ConversationResponse
        | null;

      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to load conversation.");
      }

      setMessages(body?.messages ?? []);
    } catch (loadError) {
      setMessages([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load conversation.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        description="Public chat messages will appear here after visitors use the chatbot."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-3">
        {conversations.map((conversation) => (
          <button
            className={cn(
              "w-full rounded-[18px] border p-4 text-left transition",
              selectedId === conversation.id
                ? "border-ring bg-secondary"
                : "border-border bg-bg hover:bg-secondary/70",
            )}
            key={conversation.id}
            onClick={() => loadConversation(conversation.id)}
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-primary">
                {conversation.source ?? "website"}
              </p>
              <Badge variant="default">
                {conversation.message_count} messages
              </Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-fg">
              {conversation.latest_message ?? "No messages yet"}
            </p>
            <p className="mt-2 text-xs text-muted-fg">
              {formatDateTime(conversation.created_at)}
            </p>
          </button>
        ))}
      </div>

      <div className="min-h-80 rounded-[22px] border border-border bg-bg p-4">
        {loadingId ? (
          <p className="text-sm text-muted-fg">Loading conversation...</p>
        ) : error ? (
          <p className="rounded-[16px] bg-accent p-3 text-sm leading-6 text-terracotta">
            {error}
          </p>
        ) : messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                className={cn(
                  "rounded-[18px] p-3 text-sm leading-6",
                  message.role === "assistant"
                    ? "bg-secondary text-fg"
                    : "bg-terracotta text-bg",
                )}
                key={message.id}
              >
                <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] opacity-75">
                  <span>{message.role}</span>
                  <span>{formatDateTime(message.created_at)}</span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Select a conversation"
            description="Click a recent conversation to review user and assistant messages."
          />
        )}
      </div>
    </div>
  );
}
