import { ChatWindow } from "@/components/chat/chat-window";

export default function EmbedPage() {
  return (
    <main className="h-screen min-h-0 bg-bg p-2 text-fg">
      <ChatWindow className="mx-auto max-w-full" compact source="embed" />
    </main>
  );
}
