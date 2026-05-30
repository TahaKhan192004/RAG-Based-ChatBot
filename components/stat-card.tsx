export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_12px_40px_rgba(58,33,29,0.05)]">
      <p className="text-sm font-medium text-muted-fg">{label}</p>
      <p className="mt-2 font-serif text-3xl text-primary">{value}</p>
    </div>
  );
}
