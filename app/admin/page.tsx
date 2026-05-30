import { ConversationsPanel } from "@/components/admin/conversations-panel";
import { DocumentsTable } from "@/components/admin/documents-table";
import { AdminIngestionForms } from "@/components/admin/ingestion-forms";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import {
  listConversationSummaries,
  listDocuments,
} from "@/lib/supabase/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [documents, conversations] = await Promise.all([
    listDocuments(),
    listConversationSummaries(),
  ]);

  const totalChunks = documents.reduce(
    (total, document) => total + document.chunk_count,
    0,
  );
  const processingCount = documents.filter(
    (document) => document.status === "processing",
  ).length;

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl space-y-8 px-5 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-3">
            <SectionLabel>Admin</SectionLabel>
            <h1 className="font-serif text-5xl leading-tight text-primary">
              Knowledge operations.
            </h1>
            <p className="max-w-2xl text-muted-fg">
              Upload PDFs, paste text, and track the document states that will
              feed retrieval in the next phase.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button>Upload PDF</Button>
            <Button variant="secondary">Ingest text</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Documents" value={String(documents.length)} />
          <StatCard label="Chunks" value={String(totalChunks)} />
          <StatCard label="Processing" value={String(processingCount)} />
        </div>

        <AdminIngestionForms />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Manage uploaded knowledge, processing status, and Pinecone
                vector cleanup.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentsTable documents={documents} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>
                Review recent chatbot sessions. These logs are not used as
                answer-generation memory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversationsPanel conversations={conversations} />
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
