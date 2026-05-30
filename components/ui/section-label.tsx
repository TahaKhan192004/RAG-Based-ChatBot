import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return (
    <p
      className={cn(
        "text-sm font-bold uppercase tracking-[0.18em] text-terracotta",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
