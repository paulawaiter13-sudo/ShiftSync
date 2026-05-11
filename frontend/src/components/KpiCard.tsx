interface KpiCardProps {
  label: string;
  value: number;
  helper: string;
  accentClass: string;
}

export function KpiCard({ label, value, helper, accentClass }: KpiCardProps) {
  return (
    <article className="rounded-[24px] border border-line/80 bg-panel px-5 py-5 shadow-panel">
      <div className={`h-1.5 w-16 rounded-full ${accentClass}`} />
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-4xl font-semibold text-ink">{value}</p>
      <p className="mt-3 text-sm text-slate-600">{helper}</p>
    </article>
  );
}
