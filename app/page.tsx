import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";

const steps = [
  {
    title: "Upload your knowledge",
    description: "Add PDFs or paste plain text from your offer, support, and operating docs.",
  },
  {
    title: "Ask the website assistant",
    description: "Visitors ask direct questions in a public chat or embedded widget.",
  },
  {
    title: "Answers come from your own docs",
    description: "The assistant retrieves relevant chunks before drafting a grounded response.",
  },
];

export default function Home() {
  return (
    <PageShell>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-14 sm:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <SectionLabel>AI Savvy Founders</SectionLabel>
              <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] text-primary md:text-7xl">
                A grounded website assistant for founder knowledge.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-fg">
                Upload the knowledge your team already uses. Let visitors ask
                sharp questions. Return answers that stay tied to your own
                source material.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/admin">Open admin</ButtonLink>
              <ButtonLink href="/chat" variant="secondary">
                Try chatbot
              </ButtonLink>
            </div>
          </div>

          <Card className="p-3">
            <div className="rounded-[22px] bg-primary p-5 text-bg">
              <div className="flex items-center justify-between gap-4 border-b border-bg/15 pb-4">
                <div>
                  <p className="text-sm text-accent">RAG workflow</p>
                  <p className="font-serif text-3xl">Designed for Phase 1</p>
                </div>
                <Badge variant="accent">UI ready</Badge>
              </div>
              <div className="mt-5 space-y-3">
                {steps.map((step, index) => (
                  <div
                    className="grid grid-cols-[2.25rem_1fr] gap-3 rounded-[18px] bg-bg/8 p-3"
                    key={step.title}
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-accent font-bold text-terracotta">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-accent">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Vector store" value="Pinecone" />
          <StatCard label="Embeddings" value="Gemini" />
          <StatCard label="Responses" value="Groq" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle className="text-2xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-fg">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
