import { LoadingDots } from "@/components/ui/loading-dots";
import { MessageBubble, type ChatMessage } from "./message-bubble";

export function MessageList({
  messages,
  isLoading,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading ? (
        <div className="max-w-[86%] rounded-[22px] bg-secondary px-4 py-3 text-sm leading-6 text-fg">
          <LoadingDots />
        </div>
      ) : null}
    </div>
  );
}
