export function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Loading">
      <span className="size-1.5 rounded-full bg-terracotta" />
      <span className="size-1.5 rounded-full bg-terracotta/70" />
      <span className="size-1.5 rounded-full bg-terracotta/40" />
    </span>
  );
}
