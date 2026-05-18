import type { HandoverStatus } from '../../types/handover';

const toneClass: Record<HandoverStatus, string> = {
  Draft: 'border-ops-muted/50 bg-ops-elevated text-ops-muted',
  Ready: 'border-state-open/45 bg-state-open/12 text-state-open',
  Completed: 'border-sev-low/45 bg-sev-low/10 text-sev-low'
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide',
  md: 'px-2.5 py-1 text-xs font-semibold uppercase tracking-wide'
};

interface HandoverStatusBadgeProps {
  status: HandoverStatus;
  size?: keyof typeof sizeMap;
}

export function HandoverStatusBadge({ status, size = 'sm' }: HandoverStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border capitalize ${sizeMap[size]} ${toneClass[status]}`}
    >
      {status}
    </span>
  );
}
