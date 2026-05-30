import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-dashed border-ring bg-bg p-6 text-center",
        className,
      )}
    >
      <p className="font-serif text-2xl text-primary">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-fg">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
