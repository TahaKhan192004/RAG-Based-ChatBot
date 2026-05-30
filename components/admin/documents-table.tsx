"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Document, DocumentStatus } from "@/types";

const statusLabels: Record<DocumentStatus, string> = {
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

const statusVariants: Record<DocumentStatus, "default" | "accent" | "outline"> =
  {
    processing: "accent",
    completed: "default",
    failed: "outline",
  };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function DocumentsTable({ documents }: { documents: Document[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function deleteDocument(document: Document) {
    const confirmed = window.confirm(
      `Delete "${document.title}" and its Pinecone vectors? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(document.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/documents/${document.id}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? "Document deletion failed.");
      }

      setMessage({
        type: "success",
        text: `Deleted "${document.title}".`,
      });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Document deletion failed.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        description="After you ingest PDF or text knowledge, document rows and status will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p
          className={`rounded-[16px] border p-3 text-sm leading-6 ${
            message.type === "success"
              ? "border-border bg-secondary text-primary"
              : "border-border bg-accent text-terracotta"
          }`}
        >
          {message.text}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-[22px] border border-border">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="bg-secondary text-primary">
            <tr>
              <th className="px-4 py-3 font-bold">Title</th>
              <th className="px-4 py-3 font-bold">Source</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Chunks</th>
              <th className="px-4 py-3 font-bold">Created</th>
              <th className="px-4 py-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-bg">
            {documents.map((document) => (
              <tr key={document.id}>
                <td className="px-4 py-4 align-top">
                  <p className="font-semibold text-primary">{document.title}</p>
                  {document.error_message ? (
                    <p className="mt-2 rounded-[14px] bg-accent p-2 text-xs leading-5 text-terracotta">
                      {document.error_message}
                    </p>
                  ) : document.file_name ? (
                    <p className="mt-1 text-xs text-muted-fg">
                      {document.file_name}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4 align-top">
                  <Badge variant="outline">{document.source_type}</Badge>
                </td>
                <td className="px-4 py-4 align-top">
                  <Badge variant={statusVariants[document.status]}>
                    {statusLabels[document.status]}
                  </Badge>
                </td>
                <td className="px-4 py-4 align-top font-semibold text-primary">
                  {document.chunk_count}
                </td>
                <td className="px-4 py-4 align-top text-muted-fg">
                  {formatDate(document.created_at)}
                </td>
                <td className="px-4 py-4 align-top">
                  <Button
                    className="h-10 px-4"
                    disabled={deletingId === document.id}
                    onClick={() => deleteDocument(document)}
                    type="button"
                    variant="secondary"
                  >
                    {deletingId === document.id ? "Deleting..." : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
