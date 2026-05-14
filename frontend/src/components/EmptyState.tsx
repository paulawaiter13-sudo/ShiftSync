interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-ops-border bg-ops-panel/40 px-4 py-10 text-center shadow-card sm:px-6 sm:py-12">
      <p className="text-base font-semibold tracking-tight text-ops-foreground sm:text-lg">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-ops-muted sm:text-sm">{description}</p>
    </div>
  );
}
