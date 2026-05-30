"use client";

import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import type { ChatMessage } from "./message-bubble";
import { cn } from "@/lib/utils";

type ChatStreamEvent = {
  type?: "meta" | "token" | "done" | "error";
  conversationId?: string;
  token?: string;
  error?: string;
};

const introMessage: ChatMessage = {
  id: "intro",
  role: "assistant",
  content: "Ask me anything from the uploaded knowledge base.",
};

export function ChatWindow({
  source,
  compact = false,
  className,
}: {
  source: "chat" | "embed";
  compact?: boolean;
  className?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([introMessage]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const trimmed = input.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    const assistantMessageId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          conversationId,
          source,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "The assistant could not respond.");
      }

      if (!response.body) {
        throw new Error("The assistant returned an empty response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const event = JSON.parse(line) as ChatStreamEvent;

          if (event.type === "meta" && event.conversationId) {
            setConversationId(event.conversationId);
          }

          if (event.type === "token" && event.token) {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, content: message.content + event.token }
                  : message,
              ),
            );
          }

          if (event.type === "error") {
            throw new Error(event.error ?? "The assistant could not respond.");
          }
        }
      }
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content:
                  error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again.",
              }
            : message,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      className={cn(
        "flex min-h-0 w-full flex-col overflow-hidden border border-border bg-card shadow-[0_22px_80px_rgba(58,33,29,0.09)]",
        compact ? "h-full rounded-[24px]" : "h-[min(720px,75vh)] rounded-[28px]",
        className,
      )}
    >
      <div
        className={cn(
          "border-b border-border bg-secondary/70",
          compact ? "px-4 py-3" : "p-5",
        )}
      >
        <p
          className={cn(
            "font-serif leading-tight text-primary",
            compact ? "text-2xl" : "text-3xl",
          )}
        >
          AI Savvy Assistant
        </p>
        <p className="text-sm text-muted-fg">
          Answers from your uploaded knowledge base.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={scrollRef} />
      </div>
      <div className="border-t border-border bg-card p-3 sm:p-4">
        <ChatInput
          disabled={isLoading}
          onChange={setInput}
          onSubmit={sendMessage}
          value={input}
        />
      </div>
    </section>
  );
}
