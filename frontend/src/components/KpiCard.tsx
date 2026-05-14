import type { ReactNode } from 'react';

type KpiTone = 'neutral' | 'critical' | 'warning' | 'positive' | 'info';

const toneBar: Record<KpiTone, string> = {
  neutral: 'bg-ops-muted',
  critical: 'bg-sev-critical',
  warning: 'bg-state-investigating',
  positive: 'bg-sev-low',
  info: 'bg-state-open'
};

interface KpiCardProps {
  label: string;
  value: number;
  helper: string;
  tone?: KpiTone;
  icon?: ReactNode;
}

export function KpiCard({ label, value, helper, tone = 'neutral', icon }: KpiCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-ops-border bg-ops-panel p-3 shadow-card transition hover:border-ops-muted/20 hover:shadow-card-hover sm:p-3.5 md:p-4">
      <div className={`absolute left-0 top-0 h-full w-0.5 ${toneBar[tone]}`} />
      <div className="pl-2.5 sm:pl-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:text-2xs">{label}</p>
          {icon ? <span className="text-ops-muted opacity-70 transition group-hover:opacity-100">{icon}</span> : null}
        </div>
        <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight text-ops-foreground sm:text-3xl">
          {value}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ops-muted sm:text-xs">{helper}</p>
      </div>
    </article>
  );
}
