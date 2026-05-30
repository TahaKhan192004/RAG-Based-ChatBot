import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/admin", label: "Admin" },
  { href: "/embed", label: "Embed" },
];

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border/80 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="font-serif text-2xl text-primary">
            AI Savvy RAG
          </Link>
          <nav className="flex w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 text-sm sm:w-auto">
            {links.map((link) => (
              <Link
                className="shrink-0 rounded-full px-4 py-2 text-muted-fg transition hover:bg-secondary hover:text-fg"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
