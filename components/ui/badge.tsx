import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-secondary text-primary",
  accent: "bg-accent text-terracotta",
  outline: "border border-border bg-bg text-muted-fg",
};

export function Badge({
  children,
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
