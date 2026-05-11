interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-line bg-panel px-6 py-12 text-center shadow-panel">
      <p className="font-heading text-2xl font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">{description}</p>
    </div>
  );
}
