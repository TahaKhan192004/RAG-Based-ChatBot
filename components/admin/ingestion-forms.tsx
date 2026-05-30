"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type RequestState = {
  loading: boolean;
  message: string | null;
  type: "success" | "error" | null;
};

const initialState: RequestState = {
  loading: false,
  message: null,
  type: null,
};

async function readApiMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
    result?: { chunkCount?: number };
  } | null;

  if (!response.ok) {
    return body?.error ?? "Request failed.";
  }

  const chunkCount = body?.result?.chunkCount;
  return typeof chunkCount === "number"
    ? `Ingestion completed with ${chunkCount} chunks.`
    : "Ingestion completed.";
}

function StatusMessage({ state }: { state: RequestState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={`mt-4 rounded-[16px] border p-3 text-sm leading-6 ${
        state.type === "success"
          ? "border-border bg-secondary text-primary"
          : "border-border bg-accent text-terracotta"
      }`}
    >
      {state.message}
    </p>
  );
}

export function AdminIngestionForms() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [text, setText] = useState("");
  const [pdfState, setPdfState] = useState<RequestState>(initialState);
  const [textState, setTextState] = useState<RequestState>(initialState);

  async function handlePdfSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPdfState({ loading: true, message: null, type: null });

    const file = fileInputRef.current?.files?.[0];

    if (!pdfTitle.trim() || !file) {
      setPdfState({
        loading: false,
        message: "Add a title and choose a PDF before uploading.",
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", pdfTitle.trim());
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const message = await readApiMessage(response);

      if (!response.ok) {
        setPdfState({ loading: false, message, type: "error" });
        return;
      }

      setPdfTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPdfState({ loading: false, message, type: "success" });
      router.refresh();
    } catch (error) {
      setPdfState({
        loading: false,
        message:
          error instanceof Error ? error.message : "PDF upload failed.",
        type: "error",
      });
    }
  }

  async function handleTextSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTextState({ loading: true, message: null, type: null });

    try {
      const response = await fetch("/api/admin/ingest-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: textTitle,
          text,
        }),
      });
      const message = await readApiMessage(response);

      if (!response.ok) {
        setTextState({ loading: false, message, type: "error" });
        return;
      }

      setTextTitle("");
      setText("");
      setTextState({ loading: false, message, type: "success" });
      router.refresh();
    } catch (error) {
      setTextState({
        loading: false,
        message:
          error instanceof Error ? error.message : "Text ingestion failed.",
        type: "error",
      });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
          <CardDescription>
            Add a titled PDF and ingest it into Pinecone. Large PDFs may take
            longer to process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handlePdfSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-primary">Title</span>
              <Input
                disabled={pdfState.loading}
                onChange={(event) => setPdfTitle(event.target.value)}
                placeholder="Founder FAQ"
                type="text"
                value={pdfTitle}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-primary">PDF file</span>
              <input
                accept="application/pdf,.pdf"
                className="w-full rounded-[18px] border border-border bg-bg p-3 text-sm text-muted-fg file:mr-4 file:rounded-full file:border-0 file:bg-terracotta file:px-4 file:py-2 file:text-sm file:font-bold file:text-bg"
                disabled={pdfState.loading}
                ref={fileInputRef}
                type="file"
              />
            </label>
            <p className="text-sm leading-6 text-muted-fg">
              Large PDFs may take longer to process. Keep uploads under 8 MB for
              this MVP route.
            </p>
            <Button className="w-full" disabled={pdfState.loading} type="submit">
              {pdfState.loading ? "Processing..." : "Upload and ingest"}
            </Button>
          </form>
          <StatusMessage state={pdfState} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingest text</CardTitle>
          <CardDescription>
            Paste plain text knowledge for immediate chunking, embedding, and
            indexing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleTextSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-primary">Title</span>
              <Input
                disabled={textState.loading}
                onChange={(event) => setTextTitle(event.target.value)}
                placeholder="Offer positioning notes"
                type="text"
                value={textTitle}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-primary">Knowledge text</span>
              <Textarea
                className="min-h-64"
                disabled={textState.loading}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste plain text knowledge here..."
                value={text}
              />
            </label>
            <Button
              className="w-full"
              disabled={textState.loading}
              type="submit"
            >
              {textState.loading ? "Processing..." : "Submit text"}
            </Button>
          </form>
          <StatusMessage state={textState} />
        </CardContent>
      </Card>
    </div>
  );
}
