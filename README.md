# AI Savvy RAG Bot

A production-ready foundation for a RAG chatbot web app built with Next.js App Router, TypeScript, Tailwind CSS, Pinecone, Gemini, Groq, Supabase, and Vercel.

This phase includes the project shell, design system, Supabase schema, typed Supabase clients, admin read routes, and UI placeholders. Full RAG ingestion and answer generation are intentionally left for the next phase.

## Routes

- `/` - landing page
- `/chat` - public chatbot page
- `/admin` - admin dashboard for uploads and document status
- `/embed` - embeddable chatbot shell
- `/api/chat` - chat endpoint placeholder
- `/api/admin/upload` - PDF upload endpoint placeholder
- `/api/admin/ingest-text` - text ingestion endpoint placeholder
- `/api/admin/documents` - document metadata from Supabase
- `/api/admin/conversations` - recent conversation summaries from Supabase
- `/api/admin/conversations/[id]` - conversation messages from Supabase

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in Supabase, Pinecone, Gemini, and Groq credentials in `.env.local`.

4. Create the Supabase tables using `supabase/schema.sql` or the SQL below.

5. Run the development server:

```bash
npm run dev
```

6. Open `http://localhost:3000`.

## Supabase Setup

Create a Supabase project, then add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe for browser clients. `SUPABASE_SERVICE_ROLE_KEY` must stay server-only and is used only from server routes/helpers.

Run this schema in the Supabase SQL editor:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null check (source_type in ('pdf', 'text')),
  file_name text,
  status text not null check (status in ('processing', 'completed', 'failed')),
  chunk_count integer not null default 0,
  error_message text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  source text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.document_chunks (
  id text primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  pinecone_id text not null,
  created_at timestamp with time zone not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_documents_updated_at on public.documents;

create trigger set_documents_updated_at
before update on public.documents
for each row
execute function public.set_updated_at();

create index if not exists documents_created_at_idx
  on public.documents (created_at desc);

create index if not exists conversations_created_at_idx
  on public.conversations (created_at desc);

create index if not exists messages_conversation_created_at_idx
  on public.messages (conversation_id, created_at asc);

create index if not exists document_chunks_document_id_idx
  on public.document_chunks (document_id, chunk_index);
```

RLS should be enabled before production with policies that match your auth model. For the MVP, keep writes through server API routes and do not expose service-role access to the browser.

## Pinecone Setup

Create a Pinecone index for Gemini embeddings and add these values to `.env.local`:

```bash
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
GEMINI_API_KEY=
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_EMBEDDING_DIMENSIONS=768
```

Use an index dimension that matches the embedding dimensions your app outputs. This app requests `gemini-embedding-001` with `GEMINI_EMBEDDING_DIMENSIONS=768`, so create a 768-dimensional dense vector index with cosine similarity.

Ingestion utilities live in:

- `lib/ai/gemini.ts` - `generateEmbedding(text)`
- `lib/rag/chunk.ts` - text cleaning and chunking
- `lib/pdf/extract.ts` - PDF text extraction
- `lib/pinecone/client.ts` - server-only Pinecone client
- `lib/rag/ingest.ts` - document ingestion, Pinecone upsert, and Supabase status updates

Pinecone vector IDs are stable: `doc_{documentId}chunk{chunkIndex}`. Do not switch to random IDs, because stable IDs allow repeat ingestion to overwrite the same document chunks.

## Verification

```bash
npm run lint
npm run build
```

## Embed Snippet

Use the compact chatbot in any site with an iframe:

```html
<iframe src="https://YOUR_DOMAIN.vercel.app/embed" style="width:100%;height:650px;border:0;border-radius:20px;"></iframe>
```

## Planned Data Flow

Admin ingestion will extract uploaded PDF or text content, clean it, chunk it, create Gemini embeddings, and upsert vectors into Pinecone with document metadata. Supabase will track documents and processing status.

Public chat will log user messages in Supabase, embed the latest question with Gemini, retrieve relevant Pinecone chunks, send only retrieved context and the current question to Groq, return a grounded answer, and log the AI response. Conversation history is for logs and review only, not long-term memory during answer generation.
