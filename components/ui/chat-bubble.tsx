import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChatBubble({
  children,
  role = "assistant",
}: {
  children: ReactNode;
  role?: "assistant" | "user";
}) {
  return (
    <div
      className={cn(
        "max-w-[84%] rounded-[22px] px-4 py-3 text-sm leading-6",
        role === "assistant"
          ? "bg-secondary text-fg"
          : "ml-auto bg-terracotta text-bg",
      )}
    >
      {children}
    </div>
  );
}
