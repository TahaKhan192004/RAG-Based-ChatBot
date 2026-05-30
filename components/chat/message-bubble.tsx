import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div
      className={cn(
        "max-w-[86%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-[0_8px_24px_rgba(58,33,29,0.05)]",
        message.role === "assistant"
          ? "bg-secondary text-fg"
          : "ml-auto bg-terracotta text-bg",
      )}
    >
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}
