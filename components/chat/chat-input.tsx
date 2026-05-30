"use client";

import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatInput({
  disabled,
  value,
  onChange,
  onSubmit,
}: {
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className="flex items-center gap-2 rounded-full border border-border bg-bg p-2 shadow-inner shadow-primary/4"
      onSubmit={handleSubmit}
    >
      <Input
        className="h-11 border-0 bg-transparent shadow-none focus-visible:outline-0"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ask about the knowledge base..."
        type="text"
        value={value}
      />
      <Button className="h-11 shrink-0 px-5" disabled={disabled} type="submit">
        Send
      </Button>
    </form>
  );
}
