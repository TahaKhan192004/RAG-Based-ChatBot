-- AI Savvy RAG Bot Supabase schema
-- Run this in the Supabase SQL editor or through Supabase migrations.
-- RLS should be enabled before production. For this MVP, writes should go
-- through Next.js server API routes that use SUPABASE_SERVICE_ROLE_KEY only on
-- the server.

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

-- Optional tracking table. Pinecone remains the source of truth for vectors.
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

-- Enable RLS before production and add policies that match your auth model:
-- alter table public.documents enable row level security;
-- alter table public.conversations enable row level security;
-- alter table public.messages enable row level security;
-- alter table public.document_chunks enable row level security;
