import { NextResponse, type NextRequest } from "next/server";
import { getPineconeIndex } from "@/lib/pinecone/client";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service client is not configured." },
      { status: 500 },
    );
  }

  const { id } = await params;

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, title")
    .eq("id", id)
    .single();

  if (documentError) {
    return NextResponse.json(
      { error: documentError.message },
      { status: 404 },
    );
  }

  try {
    const index = getPineconeIndex();
    await index.deleteMany({
      filter: {
        documentId: { $eq: document.id },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete Pinecone vectors.";

    return NextResponse.json(
      {
        error: `Pinecone deletion failed for "${document.title}": ${message}`,
      },
      { status: 500 },
    );
  }

  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", document.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, documentId: document.id });
}
