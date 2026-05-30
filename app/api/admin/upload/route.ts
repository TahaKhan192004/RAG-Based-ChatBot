import { NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdf/extract";
import { ingestDocument } from "@/lib/rag/ingest";
import { requireSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PDF_SIZE_BYTES = 8 * 1024 * 1024;

async function markDocumentFailed(documentId: string, errorMessage: string) {
  const supabase = requireSupabaseServiceClient();

  await supabase
    .from("documents")
    .update({
      status: "failed",
      error_message: errorMessage,
    })
    .eq("id", documentId);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const file = formData.get("file");

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 },
      );
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { error: "PDF is too large. Please upload a file under 8 MB." },
        { status: 413 },
      );
    }

    const supabase = requireSupabaseServiceClient();
    const trimmedTitle = title.trim();

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        title: trimmedTitle,
        source_type: "pdf",
        file_name: file.name,
        status: "processing",
        chunk_count: 0,
        error_message: null,
      })
      .select("*")
      .single();

    if (documentError) {
      return NextResponse.json({ error: documentError.message }, { status: 500 });
    }

    let text: string;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      text = await extractTextFromPdf(buffer);
    } catch (error) {
      const message =
        error instanceof Error
          ? `PDF text extraction failed: ${error.message}`
          : "PDF text extraction failed.";
      await markDocumentFailed(document.id, message);
      return NextResponse.json({ error: message }, { status: 422 });
    }

    const result = await ingestDocument({
      documentId: document.id,
      title: trimmedTitle,
      sourceType: "pdf",
      fileName: file.name,
      text,
    });

    return NextResponse.json({ documentId: document.id, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF ingestion failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
