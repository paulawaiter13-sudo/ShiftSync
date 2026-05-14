import type { AlertStatus } from '../types/alert';
import type { IncidentStatus } from '../types/incident';

const alertStatusClass: Record<AlertStatus, string> = {
  New: 'border-state-new/40 bg-state-new/15 text-state-new',
  Acknowledged: 'border-state-acknowledged/40 bg-state-acknowledged/15 text-state-acknowledged',
  Investigating: 'border-state-investigating/40 bg-state-investigating/15 text-state-investigating',
  Closed: 'border-state-closed/40 bg-state-closed/15 text-state-closed'
};

const incidentStatusClass: Record<IncidentStatus, string> = {
  Open: 'border-state-open/40 bg-state-open/15 text-state-open',
  Investigating: 'border-state-investigating/40 bg-state-investigating/15 text-state-investigating',
  Monitoring: 'border-state-monitoring/40 bg-state-monitoring/15 text-state-monitoring',
  Resolved: 'border-state-resolved/40 bg-state-resolved/15 text-state-resolved',
  Closed: 'border-state-closed/40 bg-state-closed/15 text-state-closed'
};

const sizeMap = {
  xs: 'px-1.5 py-0.5 text-[10px] font-semibold leading-none',
  sm: 'px-2 py-0.5 text-2xs font-medium',
  md: 'px-2.5 py-1 text-xs font-medium'
};

type StatusBadgeProps =
  | { domain: 'alert'; status: AlertStatus; size?: keyof typeof sizeMap }
  | { domain: 'incident'; status: IncidentStatus; size?: keyof typeof sizeMap };

export function StatusBadge(props: StatusBadgeProps) {
  const size = props.size ?? 'sm';
  const sizeClass = sizeMap[size];
  const tone =
    props.domain === 'alert'
      ? alertStatusClass[props.status]
      : incidentStatusClass[props.status];
  const status = props.status;

  return (
    <span
      className={`inline-flex items-center rounded-full border capitalize tracking-tight ${sizeClass} ${tone}`}
    >
      {status}
    </span>
  );
}
