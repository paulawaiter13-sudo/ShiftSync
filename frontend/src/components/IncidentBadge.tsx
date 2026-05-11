import type { AlertSeverity } from '../types/alert';
import type { IncidentStatus } from '../types/incident';

const severityStyles: Record<AlertSeverity, string> = {
  Low: 'bg-slate-700 text-white',
  Medium: 'bg-amber-500 text-white',
  High: 'bg-orange-500 text-white',
  Critical: 'bg-red-600 text-white'
};

const statusStyles: Record<IncidentStatus, string> = {
  Open: 'bg-red-100 text-red-700',
  Investigating: 'bg-orange-100 text-orange-700',
  Monitoring: 'bg-sky-100 text-sky-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-200 text-slate-700'
};

interface IncidentBadgeProps {
  type: 'severity' | 'status';
  value: AlertSeverity | IncidentStatus;
}

export function IncidentBadge({ type, value }: IncidentBadgeProps) {
  const className =
    type === 'severity'
      ? severityStyles[value as AlertSeverity]
      : statusStyles[value as IncidentStatus];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {value}
    </span>
  );
}
