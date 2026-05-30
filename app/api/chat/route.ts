import { generateEmbedding } from "@/lib/ai/gemini";
import { streamGroqAnswer } from "@/lib/ai/groq";
import { buildGroundedPrompt, getNoKnowledgeBaseAnswer } from "@/lib/rag/prompt";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { requireSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatRequestBody = {
  message?: unknown;
  conversationId?: unknown;
  visitorId?: unknown;
  source?: unknown;
};

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function jsonLine(payload: unknown) {
  return `${JSON.stringify(payload)}\n`;
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();

  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = getStringValue(body.message);

    if (!message) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    if (message.length > 4000) {
      return Response.json(
        { error: "Message is too long. Please keep it under 4000 characters." },
        { status: 400 },
      );
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let conversationId: string | null = null;

        try {
          const supabase = requireSupabaseServiceClient();
          const requestedConversationId = getStringValue(body.conversationId);
          conversationId = requestedConversationId;

          if (!conversationId) {
            const { data: conversation, error: conversationError } =
              await supabase
                .from("conversations")
                .insert({
                  visitor_id: getStringValue(body.visitorId),
                  source: getStringValue(body.source) ?? "website",
                })
                .select("id")
                .single();

            if (conversationError) {
              throw new Error(
                `Failed to create conversation: ${conversationError.message}`,
              );
            }

            conversationId = conversation.id;
          }

          controller.enqueue(
            encoder.encode(jsonLine({ type: "meta", conversationId })),
          );

          const { error: userMessageError } = await supabase
            .from("messages")
            .insert({
              conversation_id: conversationId,
              role: "user",
              content: message,
            });

          if (userMessageError) {
            throw new Error(
              `Failed to save user message: ${userMessageError.message}`,
            );
          }

          const embedding = await generateEmbedding(message);
          const chunks = await retrieveRelevantChunks({ embedding, topK: 5 });

          const answer =
            chunks.length === 0
              ? getNoKnowledgeBaseAnswer()
              : await streamGroqAnswer(
                  buildGroundedPrompt({
                    question: message,
                    chunks: chunks.slice(0, 5),
                  }),
                  (token) => {
                    controller.enqueue(
                      encoder.encode(jsonLine({ type: "token", token })),
                    );
                  },
                );

          if (chunks.length === 0) {
            controller.enqueue(
              encoder.encode(jsonLine({ type: "token", token: answer })),
            );
          }

          const { error: assistantMessageError } = await supabase
            .from("messages")
            .insert({
              conversation_id: conversationId,
              role: "assistant",
              content: answer,
            });

          if (assistantMessageError) {
            throw new Error(
              `Failed to save assistant message: ${assistantMessageError.message}`,
            );
          }

          controller.enqueue(encoder.encode(jsonLine({ type: "done" })));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Chat request failed.";
          controller.enqueue(
            encoder.encode(jsonLine({ type: "error", error: message })),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat request failed.";

    return Response.json({ error: message }, { status: 500 });
  }
}
