import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-terracotta text-bg shadow-[0_10px_30px_rgba(122,31,43,0.16)] hover:bg-primary",
  secondary:
    "border border-terracotta/35 bg-transparent text-terracotta hover:bg-accent",
  ghost: "bg-transparent text-primary hover:bg-secondary",
};

const base =
  "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50";

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <button className={cn(base, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className = "",
  href,
  variant = "primary",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: Variant;
}) {
  return (
    <Link className={cn(base, styles[variant], className)} href={href} {...props}>
      {children}
    </Link>
  );
}
