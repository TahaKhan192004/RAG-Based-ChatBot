import { ChatWindow } from "@/components/chat/chat-window";
import { PageShell } from "@/components/page-shell";
import { SectionLabel } from "@/components/ui/section-label";

export default function ChatPage() {
  return (
    <PageShell>
      <section className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-5xl flex-col items-center gap-8 px-5 py-8 sm:px-6">
        <div className="max-w-2xl space-y-3 text-center">
          <SectionLabel>Public chatbot</SectionLabel>
          <h1 className="font-serif text-5xl leading-tight text-primary">
            Test the website assistant.
          </h1>
          <p className="text-muted-fg">
            Ask questions against the uploaded knowledge base. The API stores
            messages for logs, but only retrieved document chunks are used for
            each answer.
          </p>
        </div>
        <ChatWindow source="chat" />
      </section>
    </PageShell>
  );
}
