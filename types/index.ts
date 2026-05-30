export type SourceType = "pdf" | "text";
export type DocumentStatus = "processing" | "completed" | "failed";
export type ChatRole = "user" | "assistant";

export type Document = {
  id: string;
  title: string;
  source_type: SourceType;
  file_name: string | null;
  status: DocumentStatus;
  chunk_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  visitor_id: string | null;
  source: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
};

export type DocumentChunk = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  pinecone_id: string;
  created_at: string;
};

export type ConversationSummary = Conversation & {
  message_count: number;
  latest_message: string | null;
  latest_message_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: Document;
        Insert: Omit<Document, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Document, "id" | "created_at">> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Conversation, "id" | "created_at">>;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Message, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      document_chunks: {
        Row: DocumentChunk;
        Insert: DocumentChunk;
        Update: Partial<Omit<DocumentChunk, "id">>;
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
