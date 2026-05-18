import type { HandoverDetail } from '../../types/handover';
import { HandoverStatusBadge } from './HandoverStatusBadge';

const tsFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

interface HandoverSummaryCardProps {
  handover: HandoverDetail;
}

export function HandoverSummaryCard({ handover }: HandoverSummaryCardProps) {
  return (
    <div className="rounded-xl border border-state-open/20 bg-[linear-gradient(135deg,rgba(34,197,94,0.08),transparent_55%)] p-5 shadow-card md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-2xs font-bold uppercase tracking-widest text-state-open">Handover</p>
        <HandoverStatusBadge status={handover.status} size="md" />
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ops-foreground md:text-3xl">
        {handover.shiftType} · {handover.shiftDate}
      </h1>
      <p className="mt-1 text-sm text-ops-muted">
        Logged by <span className="font-medium text-ops-foreground">{handover.createdBy}</span>
        <span className="mx-2 text-ops-border">|</span>
        <span className="font-mono text-xs tabular-nums text-ops-muted/90">
          {tsFmt.format(new Date(handover.createdAt))}
        </span>
      </p>
      <div className="mt-5 rounded-lg border border-ops-border bg-ops-panel/90 p-4">
        <p className="text-2xs font-semibold uppercase tracking-wide text-ops-muted">Summary</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ops-foreground">{handover.summary || '—'}</p>
      </div>
    </div>
  );
}
