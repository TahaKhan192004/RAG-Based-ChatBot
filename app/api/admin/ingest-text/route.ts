import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/rag/ingest";
import { requireSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type IngestTextBody = {
  title?: unknown;
  text?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IngestTextBody;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    if (text.length < 80) {
      return NextResponse.json(
        { error: "Text must be at least 80 characters for ingestion." },
        { status: 400 },
      );
    }

    const supabase = requireSupabaseServiceClient();
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        title,
        source_type: "text",
        file_name: null,
        status: "processing",
        chunk_count: 0,
        error_message: null,
      })
      .select("*")
      .single();

    if (documentError) {
      return NextResponse.json({ error: documentError.message }, { status: 500 });
    }

    const result = await ingestDocument({
      documentId: document.id,
      title,
      sourceType: "text",
      fileName: null,
      text,
    });

    return NextResponse.json({ documentId: document.id, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Text ingestion failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
