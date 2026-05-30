import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service client is not configured." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data });
}
